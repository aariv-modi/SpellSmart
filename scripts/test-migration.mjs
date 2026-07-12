import { migrateUserData } from '../src/utils/migrateUserData.mjs';

let passed = 0;
let failed = 0;

const assert = (label, cond, detail) => {
    if (cond) {
        passed++;
        console.log(`  PASS  ${label}`);
    } else {
        failed++;
        console.log(`  FAIL  ${label}`);
        if (detail !== undefined) console.log(`        ${JSON.stringify(detail)}`);
    }
};

const section = (name) => console.log(`\n${name}`);

// Case A: pre-v14 user with the *old* defaultUserData shape
section('A. pre-v14 default-shape user');
{
    const input = {
        newUser: false,
        newSoloMode: true,
        newBuddyMode: true,
        spellingLists: [],
        bookmarkedWords: [],
        missedWords: [],
        recentLists: [],
        numSessions: 0,
    };
    const out = migrateUserData(input);

    assert('streak added', out.streak?.currentDays === 0 && out.streak?.lastPracticeDate === null);
    assert('streak has only currentDays + lastPracticeDate', Object.keys(out.streak).sort().join(',') === 'currentDays,lastPracticeDate');
    assert('reviewQueue added', Array.isArray(out.reviewQueue) && out.reviewQueue.length === 0);
    assert('sessionHistory added', Array.isArray(out.sessionHistory) && out.sessionHistory.length === 0);
    assert('settings added', out.settings?.reminderTime === '19:00' && out.settings?.reminderEnabled === false);
    assert('settings has only reminderTime + reminderEnabled', Object.keys(out.settings).sort().join(',') === 'reminderEnabled,reminderTime');
    assert('subscription added', out.subscription?.plusUntil === null);
    assert('newUser dropped', !('newUser' in out));
    assert('recentLists dropped', !('recentLists' in out));
    assert('numSessions preserved', out.numSessions === 0);
    assert('input not mutated', 'newUser' in input && 'recentLists' in input);
}

// Case B: pre-v14 user with real practice data — make sure nothing gets blown away
section('B. pre-v14 user with real data');
{
    const input = {
        newUser: false,
        newSoloMode: false,
        newBuddyMode: true,
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

    assert('spellingLists preserved', JSON.stringify(out.spellingLists) === JSON.stringify(input.spellingLists));
    assert('bookmarkedWords preserved', JSON.stringify(out.bookmarkedWords) === JSON.stringify(input.bookmarkedWords));
    assert('missedWords preserved', JSON.stringify(out.missedWords) === JSON.stringify(input.missedWords));
    assert('numSessions preserved', out.numSessions === 47);
    assert('newSoloMode preserved', out.newSoloMode === false);
    assert('streak added', out.streak !== undefined);
    assert('newUser dropped', !('newUser' in out));
    assert('recentLists dropped', !('recentLists' in out));
}

// Case C: already-migrated (current shape) user → should be returned unchanged (referentially equal)
section('C. already-migrated user (idempotency)');
{
    const input = {
        newSoloMode: true,
        newBuddyMode: true,
        spellingLists: [],
        bookmarkedWords: [],
        missedWords: [],
        numSessions: 5,
        streak: { currentDays: 3, lastPracticeDate: '2026-04-30' },
        reviewQueue: [{ word: 'photosynthesis', correctStreak: 1, addedAt: 1, lastReviewedAt: 2 }],
        sessionHistory: [{ date: '2026-04-30', wordsAttempted: 10, wordsCorrect: 8, listName: 'X', durationMs: 60000 }],
        settings: { reminderTime: '20:00', reminderEnabled: true },
        subscription: { plusUntil: '2027-01-01' },
    };
    const out = migrateUserData(input);

    assert('returns same reference (no-op)', out === input);
    assert('streak.currentDays preserved', out.streak.currentDays === 3);
    assert('settings.reminderTime preserved', out.settings.reminderTime === '20:00');
    assert('reviewQueue contents preserved', out.reviewQueue[0].word === 'photosynthesis');
}

// Case D: null/undefined inputs
section('D. null / undefined');
{
    assert('null returns null', migrateUserData(null) === null);
    assert('undefined returns undefined', migrateUserData(undefined) === undefined);
}

// Case E: user with stale slice-2 sub-fields that need cleanup
section('E. user with stale slice-2 sub-fields');
{
    const input = {
        newSoloMode: true,
        newBuddyMode: true,
        spellingLists: [],
        bookmarkedWords: [],
        missedWords: [],
        numSessions: 1,
        streak: { currentDays: 5, lastPracticeDate: '2026-04-30', dailyWordCount: 7, dailyDate: '2026-04-30' },
        reviewQueue: [],
        sessionHistory: [],
        settings: { reminderTime: '19:00', reminderEnabled: false, lastSeenList: { listName: 'A-D', list: ['a'] }, lastSeenMode: 'Solo' },
        subscription: { plusUntil: null },
    };
    const out = migrateUserData(input);

    assert('streak.currentDays preserved', out.streak.currentDays === 5);
    assert('streak.lastPracticeDate preserved', out.streak.lastPracticeDate === '2026-04-30');
    assert('streak.dailyWordCount dropped', !('dailyWordCount' in out.streak));
    assert('streak.dailyDate dropped', !('dailyDate' in out.streak));
    assert('settings.reminderTime preserved', out.settings.reminderTime === '19:00');
    assert('settings.lastSeenList dropped', !('lastSeenList' in out.settings));
    assert('settings.lastSeenMode dropped', !('lastSeenMode' in out.settings));
    assert('returns new object (not no-op)', out !== input);
}

// Case F: partially-migrated (missing some top-level v14 fields)
section('F. partial migration');
{
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

    assert('existing streak untouched', out.streak.currentDays === 7);
    assert('reviewQueue filled in', Array.isArray(out.reviewQueue) && out.reviewQueue.length === 0);
    assert('settings filled in', out.settings?.reminderTime === '19:00');
    assert('subscription filled in', out.subscription?.plusUntil === null);
    assert('returns new object (not no-op)', out !== input);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
