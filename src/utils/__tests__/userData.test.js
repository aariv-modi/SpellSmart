import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultUserData } from '../defaultUserData';
import { endSession, getStats, loadUserData, markLoginToday } from '../userData';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const seed = (data) => AsyncStorage.setItem('userData', JSON.stringify(data));
const stored = async () => JSON.parse(await AsyncStorage.getItem('userData'));

beforeEach(async () => {
    await AsyncStorage.clear();
    jest.useFakeTimers({ now: new Date(2026, 4, 1, 12) }); // May 1, 2026, local noon
});

afterEach(() => {
    jest.useRealTimers();
});

describe('loadUserData', () => {
    test('is null before anything is saved', async () => {
        expect(await loadUserData()).toBeNull();
    });

    test('migrates old saved data and writes the migrated version back', async () => {
        await seed({
            newUser: false,
            newSoloMode: true,
            newBuddyMode: true,
            spellingLists: [{ name: 'A', words: ['rhythm'] }],
            bookmarkedWords: [],
            missedWords: [],
            recentLists: [],
            numSessions: 3,
        });

        const data = await loadUserData();

        expect(data.streak).toEqual({ currentDays: 0, lastPracticeDate: null });
        expect(data.spellingLists).toEqual([{ name: 'A', words: ['rhythm'] }]);
        expect(await stored()).toEqual(data);
    });

    test('does not rewrite data that is already current', async () => {
        await seed(defaultUserData);
        AsyncStorage.setItem.mockClear();

        await loadUserData();

        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
});

describe('markLoginToday', () => {
    test('extends a streak from yesterday', async () => {
        await seed({
            ...defaultUserData,
            streak: { currentDays: 4, lastPracticeDate: '2026-04-30' },
        });
        await markLoginToday();

        expect((await stored()).streak).toEqual({ currentDays: 5, lastPracticeDate: '2026-05-01' });
    });

    test('restarts a broken streak at 1', async () => {
        await seed({
            ...defaultUserData,
            streak: { currentDays: 4, lastPracticeDate: '2026-04-20' },
        });
        await markLoginToday();

        expect((await stored()).streak).toEqual({ currentDays: 1, lastPracticeDate: '2026-05-01' });
    });
});

describe('endSession', () => {
    test('records the session, merges missed words without duplicates and saves bookmarks', async () => {
        await seed({ ...defaultUserData, missedWords: ['chaos'], bookmarkedWords: ['old'] });

        await endSession({
            bookmarkedWords: ['azure'],
            missedFromSession: ['rhythm', 'chaos'],
            wordsAttempted: 10,
            wordsCorrect: 8,
            listName: 'A-D',
            mode: 'Solo',
            durationMs: 90000,
        });

        const data = await stored();
        expect(data.missedWords).toEqual(['chaos', 'rhythm']);
        expect(data.bookmarkedWords).toEqual(['azure']);
        expect(data.sessionHistory).toEqual([
            {
                date: '2026-05-01',
                wordsAttempted: 10,
                wordsCorrect: 8,
                listName: 'A-D',
                mode: 'Solo',
                durationMs: 90000,
            },
        ]);
    });
});

describe('getStats', () => {
    test('reports the live streak, lifetime accuracy and reminder settings', async () => {
        await seed({
            ...defaultUserData,
            streak: { currentDays: 6, lastPracticeDate: '2026-04-30' },
            sessionHistory: [
                { wordsAttempted: 10, wordsCorrect: 7 },
                { wordsAttempted: 10, wordsCorrect: 10 },
            ],
            settings: { reminderTime: '18:30', reminderEnabled: true },
        });

        expect(await getStats()).toEqual({
            streakDays: 6,
            accuracyPct: 85,
            reminderEnabled: true,
            reminderTime: '18:30',
        });
    });
});
