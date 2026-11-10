import { migrateUserData } from '../migrateUserData.mjs';

const PRE_V14_DEFAULTS = {
    newUser: false,
    newSoloMode: true,
    newBuddyMode: true,
    spellingLists: [],
    bookmarkedWords: [],
    missedWords: [],
    recentLists: [],
    numSessions: 0,
};

describe('migrateUserData', () => {
    describe('a pre-v14 user with default data', () => {
        const input = { ...PRE_V14_DEFAULTS };
        const out = migrateUserData(input);

        test('gets the v14 fields with their defaults', () => {
            expect(out.streak).toEqual({ currentDays: 0, lastPracticeDate: null });
            expect(out.reviewQueue).toEqual([]);
            expect(out.sessionHistory).toEqual([]);
            expect(out.settings).toEqual({ reminderTime: '19:00', reminderEnabled: false });
            expect(out.subscription).toEqual({ plusUntil: null });
        });

        test('loses the retired fields', () => {
            expect(out).not.toHaveProperty('newUser');
            expect(out).not.toHaveProperty('recentLists');
        });

        test('keeps numSessions', () => {
            expect(out.numSessions).toBe(0);
        });

        test('does not mutate its input', () => {
            expect(input).toHaveProperty('newUser');
            expect(input).toHaveProperty('recentLists');
        });
    });

    test("keeps a pre-v14 user's lists, bookmarks and history", () => {
        const input = {
            ...PRE_V14_DEFAULTS,
            newSoloMode: false,
            spellingLists: [
                { name: 'MyList', words: ['abdomen', 'abrasive'] },
                { name: 'TestList', words: ['xenophobic', 'zenith'] },
            ],
            bookmarkedWords: ['aardvark', 'azure'],
            missedWords: ['xenophobic'],
            recentLists: ['MyList'],
            numSessions: 47,
        };
        const out = migrateUserData(input);

        expect(out.spellingLists).toEqual(input.spellingLists);
        expect(out.bookmarkedWords).toEqual(input.bookmarkedWords);
        expect(out.missedWords).toEqual(input.missedWords);
        expect(out.numSessions).toBe(47);
        expect(out.newSoloMode).toBe(false);
        expect(out.streak).toBeDefined();
        expect(out).not.toHaveProperty('newUser');
        expect(out).not.toHaveProperty('recentLists');
    });

    test('returns already-migrated data unchanged, as the same object', () => {
        const input = {
            newSoloMode: true,
            newBuddyMode: true,
            spellingLists: [],
            bookmarkedWords: [],
            missedWords: [],
            numSessions: 5,
            streak: { currentDays: 3, lastPracticeDate: '2026-04-30' },
            reviewQueue: [
                { word: 'photosynthesis', correctStreak: 1, addedAt: 1, lastReviewedAt: 2 },
            ],
            sessionHistory: [
                {
                    date: '2026-04-30',
                    wordsAttempted: 10,
                    wordsCorrect: 8,
                    listName: 'X',
                    durationMs: 60000,
                },
            ],
            settings: { reminderTime: '20:00', reminderEnabled: true },
            subscription: { plusUntil: '2027-01-01' },
        };
        const out = migrateUserData(input);

        expect(out).toBe(input);
        expect(out.streak.currentDays).toBe(3);
        expect(out.settings.reminderTime).toBe('20:00');
        expect(out.reviewQueue[0].word).toBe('photosynthesis');
    });

    test('passes null and undefined through', () => {
        expect(migrateUserData(null)).toBeNull();
        expect(migrateUserData(undefined)).toBeUndefined();
    });

    test('drops stale sub-fields from an earlier beta, keeping real values', () => {
        const input = {
            newSoloMode: true,
            newBuddyMode: true,
            spellingLists: [],
            bookmarkedWords: [],
            missedWords: [],
            numSessions: 1,
            streak: {
                currentDays: 5,
                lastPracticeDate: '2026-04-30',
                dailyWordCount: 7,
                dailyDate: '2026-04-30',
            },
            reviewQueue: [],
            sessionHistory: [],
            settings: {
                reminderTime: '19:00',
                reminderEnabled: false,
                lastSeenList: { listName: 'A-D', list: ['a'] },
                lastSeenMode: 'Solo',
            },
            subscription: { plusUntil: null },
        };
        const out = migrateUserData(input);

        expect(out).not.toBe(input);
        expect(out.streak).toEqual({ currentDays: 5, lastPracticeDate: '2026-04-30' });
        expect(out.settings).toEqual({ reminderTime: '19:00', reminderEnabled: false });
    });

    test('fills in whichever v14 fields are missing', () => {
        const input = {
            newSoloMode: true,
            newBuddyMode: true,
            spellingLists: [],
            bookmarkedWords: [],
            missedWords: [],
            numSessions: 1,
            streak: { currentDays: 7, lastPracticeDate: '2026-04-25' },
        };
        const out = migrateUserData(input);

        expect(out).not.toBe(input);
        expect(out.streak.currentDays).toBe(7);
        expect(out.reviewQueue).toEqual([]);
        expect(out.settings.reminderTime).toBe('19:00');
        expect(out.subscription).toEqual({ plusUntil: null });
    });
});
