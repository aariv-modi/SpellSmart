import * as Notifications from 'expo-notifications';

const REMINDER_ID = 'spellsmart-daily-reminder';

const buildBody = (streakDays) =>
    streakDays > 0
        ? `🔥 Don't break your ${streakDays}-day streak!`
        : 'Open SpellSmart and start a streak today.';

export const parseReminderTime = (timeString) => {
    const [hourStr, minuteStr] = (timeString ?? '19:00').split(':');
    const hour = Number.parseInt(hourStr, 10);
    const minute = Number.parseInt(minuteStr, 10);
    return {
        hour: Number.isFinite(hour) ? hour : 19,
        minute: Number.isFinite(minute) ? minute : 0,
    };
};

export const formatReminderTime = (hour, minute) =>
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

export const requestNotificationPermission = async () => {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
};

export const scheduleDailyReminder = async (streakDays, hour, minute) => {
    try {
        await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
    } catch {
        // No existing schedule; safe to ignore.
    }

    await Notifications.scheduleNotificationAsync({
        identifier: REMINDER_ID,
        content: {
            title: 'SpellSmart',
            body: buildBody(streakDays),
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
    });
};

export const cancelDailyReminder = async () => {
    try {
        await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
    } catch {
        // Nothing scheduled.
    }
};
