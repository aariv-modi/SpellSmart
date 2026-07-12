import AsyncStorage from "@react-native-async-storage/async-storage";
import { migrateUserData } from "./migrateUserData.mjs";
import {
    todayString,
    markLogin,
    getEffectiveStreak,
    getLifetimeAccuracy,
} from "./streakLogic.mjs";

export { migrateUserData };

export const loadUserData = async () => {
    const raw = await AsyncStorage.getItem('userData');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const migrated = migrateUserData(parsed);
    if (migrated !== parsed) {
        await AsyncStorage.setItem('userData', JSON.stringify(migrated));
    }
    return migrated;
};

export const saveUserData = async (data) => {
    await AsyncStorage.setItem('userData', JSON.stringify(data));
};

export const markLoginToday = async () => {
    const data = await loadUserData();
    const today = todayString();
    const updated = markLogin(data.streak, today);
    if (updated !== data.streak) {
        data.streak = updated;
        await saveUserData(data);
    }
};

export const endSession = async ({
    bookmarkedWords,
    missedFromSession,
    wordsAttempted,
    wordsCorrect,
    listName,
    mode,
    durationMs,
}) => {
    const data = await loadUserData();
    const today = todayString();
    data.bookmarkedWords = bookmarkedWords;
    data.missedWords = [...new Set([...data.missedWords, ...missedFromSession])];
    data.sessionHistory = [
        ...data.sessionHistory,
        { date: today, wordsAttempted, wordsCorrect, listName, mode, durationMs },
    ];
    await saveUserData(data);
};

export const getStats = async () => {
    const data = await loadUserData();
    const today = todayString();
    return {
        streakDays: getEffectiveStreak(data.streak, today),
        accuracyPct: getLifetimeAccuracy(data.sessionHistory),
        reminderEnabled: data.settings.reminderEnabled,
        reminderTime: data.settings.reminderTime,
    };
};

export const setReminderEnabled = async (enabled) => {
    const data = await loadUserData();
    data.settings = { ...data.settings, reminderEnabled: enabled };
    await saveUserData(data);
};

export const setReminderTime = async (timeString) => {
    const data = await loadUserData();
    data.settings = { ...data.settings, reminderTime: timeString };
    await saveUserData(data);
};
