import {
    daysBetween,
    getEffectiveStreak,
    getLifetimeAccuracy,
    markLogin,
} from '../streakLogic.mjs';

const FRESH = { currentDays: 0, lastPracticeDate: null };

describe('daysBetween', () => {
    test('same day is 0', () => {
        expect(daysBetween('2026-05-01', '2026-05-01')).toBe(0);
    });

    test('next day is 1', () => {
        expect(daysBetween('2026-04-30', '2026-05-01')).toBe(1);
    });

    test('counts several days', () => {
        expect(daysBetween('2026-04-28', '2026-05-01')).toBe(3);
    });

    test('works across a month boundary', () => {
        expect(daysBetween('2026-04-30', '2026-05-02')).toBe(2);
    });

    test('a missing date is infinitely far away', () => {
        expect(daysBetween(null, '2026-05-01')).toBe(Infinity);
    });
});

describe('getEffectiveStreak', () => {
    test('is 0 for a user who has never practiced', () => {
        expect(getEffectiveStreak(FRESH, '2026-05-01')).toBe(0);
    });

    test('counts a streak last extended today', () => {
        expect(
            getEffectiveStreak({ currentDays: 7, lastPracticeDate: '2026-05-01' }, '2026-05-01'),
        ).toBe(7);
    });

    test('still counts a streak last extended yesterday', () => {
        expect(
            getEffectiveStreak({ currentDays: 7, lastPracticeDate: '2026-04-30' }, '2026-05-01'),
        ).toBe(7);
    });

    test('is broken after a missed day', () => {
        expect(
            getEffectiveStreak({ currentDays: 7, lastPracticeDate: '2026-04-29' }, '2026-05-01'),
        ).toBe(0);
    });
});

describe('markLogin', () => {
    test('starts a streak of 1 for a new user', () => {
        expect(markLogin(FRESH, '2026-05-01')).toEqual({
            currentDays: 1,
            lastPracticeDate: '2026-05-01',
        });
    });

    test('is a no-op on a second login the same day', () => {
        const day1 = markLogin(FRESH, '2026-05-01');
        const again = markLogin(day1, '2026-05-01');
        expect(again).toBe(day1);
        expect(again.currentDays).toBe(1);
    });

    test('increments on consecutive days', () => {
        const day2 = markLogin(markLogin(FRESH, '2026-04-30'), '2026-05-01');
        expect(day2).toEqual({ currentDays: 2, lastPracticeDate: '2026-05-01' });
    });

    test('resets to 1 after a gap', () => {
        const later = markLogin(markLogin(FRESH, '2026-04-28'), '2026-05-01');
        expect(later).toEqual({ currentDays: 1, lastPracticeDate: '2026-05-01' });
    });

    test('keeps counting a long streak', () => {
        let streak = FRESH;
        for (const day of ['2026-04-28', '2026-04-29', '2026-04-30', '2026-05-01']) {
            streak = markLogin(streak, day);
        }
        expect(streak.currentDays).toBe(4);
    });
});

describe('getLifetimeAccuracy', () => {
    test('is null with no history', () => {
        expect(getLifetimeAccuracy([])).toBeNull();
    });

    test('is null when no words were attempted', () => {
        expect(getLifetimeAccuracy([{ wordsAttempted: 0, wordsCorrect: 0 }])).toBeNull();
    });

    test('is a whole-number percentage', () => {
        expect(getLifetimeAccuracy([{ wordsAttempted: 5, wordsCorrect: 5 }])).toBe(100);
        expect(getLifetimeAccuracy([{ wordsAttempted: 5, wordsCorrect: 4 }])).toBe(80);
    });

    test('combines sessions by total words, not by averaging', () => {
        expect(
            getLifetimeAccuracy([
                { wordsAttempted: 10, wordsCorrect: 8 },
                { wordsAttempted: 10, wordsCorrect: 9 },
            ]),
        ).toBe(85);
    });
});
