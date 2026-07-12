const MS_PER_DAY = 86400000;

export const todayString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export const daysBetween = (a, b) => {
    if (!a || !b) return Infinity;
    const da = new Date(`${a}T00:00:00`);
    const db = new Date(`${b}T00:00:00`);
    return Math.round((db - da) / MS_PER_DAY);
};

export const getEffectiveStreak = (streak, today) => {
    if (!streak?.lastPracticeDate) return 0;
    const gap = daysBetween(streak.lastPracticeDate, today);
    if (gap <= 1) return streak.currentDays;
    return 0;
};

export const markLogin = (streak, today) => {
    if (streak.lastPracticeDate === today) return streak;
    const gap = daysBetween(streak.lastPracticeDate, today);
    const currentDays = gap === 1 ? streak.currentDays + 1 : 1;
    return { ...streak, currentDays, lastPracticeDate: today };
};

export const getLifetimeAccuracy = (sessionHistory) => {
    if (!sessionHistory?.length) return null;
    let attempted = 0;
    let correct = 0;
    for (const session of sessionHistory) {
        attempted += session.wordsAttempted ?? 0;
        correct += session.wordsCorrect ?? 0;
    }
    if (attempted === 0) return null;
    return Math.round((correct / attempted) * 100);
};
