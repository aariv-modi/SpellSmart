import {
    daysBetween,
    getEffectiveStreak,
    markLogin,
    getLifetimeAccuracy,
} from '../src/utils/streakLogic.mjs';

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

const FRESH = { currentDays: 0, lastPracticeDate: null };

section('A. daysBetween');
{
    assert('same day = 0', daysBetween('2026-05-01', '2026-05-01') === 0);
    assert('next day = 1', daysBetween('2026-04-30', '2026-05-01') === 1);
    assert('three days', daysBetween('2026-04-28', '2026-05-01') === 3);
    assert('across month boundary', daysBetween('2026-04-30', '2026-05-02') === 2);
    assert('null/undefined returns Infinity', daysBetween(null, '2026-05-01') === Infinity);
}

section('B. getEffectiveStreak');
{
    assert('null lastPracticeDate = 0', getEffectiveStreak(FRESH, '2026-05-01') === 0);
    assert('today = currentDays', getEffectiveStreak({ currentDays: 7, lastPracticeDate: '2026-05-01' }, '2026-05-01') === 7);
    assert('yesterday = currentDays (still in window)', getEffectiveStreak({ currentDays: 7, lastPracticeDate: '2026-04-30' }, '2026-05-01') === 7);
    assert('two days ago = 0 (broken)', getEffectiveStreak({ currentDays: 7, lastPracticeDate: '2026-04-29' }, '2026-05-01') === 0);
}

section('C. markLogin — new user');
{
    const out = markLogin(FRESH, '2026-05-01');
    assert('streak = 1', out.currentDays === 1);
    assert('lastPracticeDate = today', out.lastPracticeDate === '2026-05-01');
}

section('D. markLogin — same day re-login is no-op');
{
    const day1 = markLogin(FRESH, '2026-05-01');
    const day1again = markLogin(day1, '2026-05-01');
    assert('returns same reference', day1again === day1);
    assert('streak unchanged at 1', day1again.currentDays === 1);
}

section('E. markLogin — consecutive days increment');
{
    const day1 = markLogin(FRESH, '2026-04-30');
    const day2 = markLogin(day1, '2026-05-01');
    assert('streak = 2', day2.currentDays === 2);
    assert('lastPracticeDate = day 2', day2.lastPracticeDate === '2026-05-01');
}

section('F. markLogin — broken streak resets to 1');
{
    const day1 = markLogin(FRESH, '2026-04-28');
    const dayN = markLogin(day1, '2026-05-01');
    assert('streak resets to 1', dayN.currentDays === 1);
    assert('lastPracticeDate = today', dayN.lastPracticeDate === '2026-05-01');
}

section('G. markLogin — long streak still works');
{
    let s = FRESH;
    s = markLogin(s, '2026-04-28');
    s = markLogin(s, '2026-04-29');
    s = markLogin(s, '2026-04-30');
    s = markLogin(s, '2026-05-01');
    assert('streak = 4 after four consecutive days', s.currentDays === 4);
}

section('H. getLifetimeAccuracy');
{
    assert('empty history = null', getLifetimeAccuracy([]) === null);
    assert('zero attempts = null', getLifetimeAccuracy([{ wordsAttempted: 0, wordsCorrect: 0 }]) === null);
    assert('100%', getLifetimeAccuracy([{ wordsAttempted: 5, wordsCorrect: 5 }]) === 100);
    assert('80%', getLifetimeAccuracy([{ wordsAttempted: 5, wordsCorrect: 4 }]) === 80);
    assert('multi-session', getLifetimeAccuracy([
        { wordsAttempted: 10, wordsCorrect: 8 },
        { wordsAttempted: 10, wordsCorrect: 9 },
    ]) === 85);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
