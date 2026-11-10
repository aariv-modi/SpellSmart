import React, { useState, useCallback } from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
    Pressable,
    ScrollView,
    Switch,
    Alert,
    Modal,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import InterText from '../components/InterText';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { color, space, text } from '../theme';
import { scaleFont } from '../utils/responsiveTextSize';
import { getStats, setReminderEnabled, setReminderTime } from '../utils/userData';
import {
    requestNotificationPermission,
    scheduleDailyReminder,
    cancelDailyReminder,
    parseReminderTime,
    formatReminderTime,
} from '../utils/notifications';

const { width, height } = Dimensions.get('window');
// On web, match the Lists tab width instead of stretching across a laptop screen.
const CONTENT_WIDTH = Platform.OS === 'web' ? Math.min(width * 0.9, height * 0.46) : width * 0.9;

const StatCard = ({ streakDays }) => (
    <Card style={styles.streakCard}>
        {streakDays > 0 ? (
            <>
                <InterText text={String(streakDays)} style={styles.streakNumber} />
                <InterText
                    text={streakDays === 1 ? 'DAY STREAK' : 'DAYS STREAK'}
                    style={styles.streakLabel}
                />
            </>
        ) : (
            <>
                <InterText text="No streak yet" style={styles.streakEmpty} />
                <InterText text="Practice today to start one" style={styles.streakSub} />
            </>
        )}
    </Card>
);

const formatTimeForDisplay = (hour, minute) => {
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
};

const ReminderSection = ({ enabled, time, onToggle, onTimeChange }) => {
    const [pickerVisible, setPickerVisible] = useState(false);
    const [draftDate, setDraftDate] = useState(null);
    const { hour, minute } = parseReminderTime(time);

    const openPicker = () => {
        const d = new Date();
        d.setHours(hour, minute, 0, 0);
        setDraftDate(d);
        setPickerVisible(true);
    };

    const closePicker = () => setPickerVisible(false);

    const commit = (date) => {
        onTimeChange(formatReminderTime(date.getHours(), date.getMinutes()));
    };

    const handleIosChange = (_, selectedDate) => {
        if (selectedDate) setDraftDate(selectedDate);
    };

    const handleIosDone = () => {
        if (draftDate) commit(draftDate);
        closePicker();
    };

    const handleAndroidChange = (event, selectedDate) => {
        closePicker();
        if (event?.type === 'set' && selectedDate) commit(selectedDate);
    };

    return (
        <Card style={styles.stack}>
            <View style={styles.reminderRow}>
                <View style={styles.reminderTextContainer}>
                    <InterText text="Daily reminder" style={styles.reminderTitle} />
                    <InterText
                        text="Nudge you to keep your streak going"
                        style={styles.reminderSubtitle}
                    />
                </View>
                <Switch
                    value={enabled}
                    onValueChange={onToggle}
                    trackColor={{ false: color.divider, true: color.brand }}
                    thumbColor={color.text}
                />
            </View>

            {enabled && (
                <Pressable
                    onPress={openPicker}
                    style={({ pressed }) => [styles.timeRow, pressed && styles.pressed]}
                >
                    <InterText text="Time" style={styles.timeRowLabel} />
                    <InterText
                        text={formatTimeForDisplay(hour, minute)}
                        style={styles.timeRowValue}
                    />
                </Pressable>
            )}

            {Platform.OS === 'ios' && (
                <Modal
                    visible={pickerVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={closePicker}
                >
                    <Pressable style={styles.modalBackdrop} onPress={closePicker}>
                        <Pressable>
                            <Card padding="md" style={styles.pickerCard}>
                                <DateTimePicker
                                    value={draftDate ?? new Date()}
                                    mode="time"
                                    display="spinner"
                                    onChange={handleIosChange}
                                    textColor={color.text}
                                />
                                <Button label="Done" onPress={handleIosDone} />
                            </Card>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}

            {Platform.OS === 'android' && pickerVisible && (
                <DateTimePicker
                    value={draftDate ?? new Date()}
                    mode="time"
                    display="spinner"
                    onChange={handleAndroidChange}
                />
            )}
        </Card>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Pressable
            onPress={() => setIsExpanded(!isExpanded)}
            style={({ pressed }) => [pressed && styles.pressed]}
        >
            <Card padding="sm" elevated={false} style={styles.faqItem}>
                <View style={styles.faqHeader}>
                    <InterText style={styles.faqQuestion} text={question} />
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={color.text}
                    />
                </View>
                {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                        <InterText style={styles.faqAnswer} text={answer} />
                    </View>
                )}
            </Card>
        </Pressable>
    );
};

const FAQS = [
    {
        question: 'How do I create a new list?',
        answer: "Tap the '+' button on the Lists tab to create a new list. Enter a name for your list and start adding words.",
    },
    {
        question: 'Can I delete a list?',
        answer: 'Navigate to the list details screen and look for the delete option in the top menu or list settings.',
    },
    {
        question: 'How do I add words to a list?',
        answer: "In the list details screen, tap the floating action button ('+') to open the add word modal. Enter the word and tap 'OK'.",
    },
    {
        question: 'Can I remove words from a list?',
        answer: "In the list details screen, tap the 'X' icon next to any word to remove it from the list.",
    },
];

const SettingsScreen = () => {
    const [stats, setStats] = useState(null);

    useFocusEffect(
        useCallback(() => {
            getStats().then(setStats);
        }, []),
    );

    const handleToggleReminder = async (value) => {
        if (value) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                Alert.alert(
                    'Notifications blocked',
                    'Allow notifications for SpellSmart in your device settings to enable daily reminders.',
                );
                return;
            }
            await setReminderEnabled(true);
            const { hour, minute } = parseReminderTime(stats?.reminderTime);
            await scheduleDailyReminder(stats?.streakDays ?? 0, hour, minute);
        } else {
            await setReminderEnabled(false);
            await cancelDailyReminder();
        }
        setStats((prev) => (prev ? { ...prev, reminderEnabled: value } : prev));
    };

    const handleTimeChange = async (timeString) => {
        await setReminderTime(timeString);
        setStats((prev) => (prev ? { ...prev, reminderTime: timeString } : prev));
        if (stats?.reminderEnabled) {
            const { hour, minute } = parseReminderTime(timeString);
            await scheduleDailyReminder(stats?.streakDays ?? 0, hour, minute);
        }
    };

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>
                {stats && (
                    <>
                        <StatCard streakDays={stats.streakDays} />
                        {Platform.OS !== 'web' && (
                            <ReminderSection
                                enabled={stats.reminderEnabled}
                                time={stats.reminderTime}
                                onToggle={handleToggleReminder}
                                onTimeChange={handleTimeChange}
                            />
                        )}
                    </>
                )}

                <View style={styles.faqSection}>
                    {FAQS.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: color.bg,
    },
    content: {
        alignItems: 'center',
        paddingTop: space.xl,
        paddingBottom: space.xxxl,
    },
    stack: {
        width: CONTENT_WIDTH,
        marginBottom: space.md,
    },
    streakCard: {
        width: CONTENT_WIDTH,
        marginBottom: space.md,
        alignItems: 'center',
        paddingVertical: space.lg,
    },
    streakNumber: {
        fontSize: scaleFont(64),
        lineHeight: scaleFont(68),
        color: color.accent,
    },
    streakLabel: {
        fontSize: text.caption,
        color: color.textMuted,
        letterSpacing: 3,
        marginTop: space.xs,
    },
    streakEmpty: {
        fontSize: text.titleLarge,
        color: color.textMuted,
        marginBottom: space.xs,
    },
    streakSub: {
        fontSize: text.bodySmall,
        color: color.textSubtle,
    },
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    reminderTextContainer: {
        flex: 1,
        paddingRight: space.lg,
    },
    reminderTitle: {
        fontSize: text.body,
    },
    reminderSubtitle: {
        fontSize: text.bodySmall,
        color: color.textMuted,
        marginTop: space.xs,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: space.md,
        marginTop: space.md,
        borderTopWidth: 1,
        borderTopColor: color.divider,
    },
    timeRowLabel: {
        fontSize: text.body,
    },
    timeRowValue: {
        fontSize: text.body,
        color: color.accent,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: color.overlay,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: space.xl,
    },
    pickerCard: {
        width: '100%',
        maxWidth: 360,
    },
    faqSection: {
        width: CONTENT_WIDTH,
        marginTop: space.lg,
    },
    faqItem: {
        marginBottom: space.sm,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: text.body,
        flex: 1,
        marginRight: space.sm,
    },
    faqAnswerContainer: {
        marginTop: space.md,
        borderTopWidth: 1,
        borderTopColor: color.divider,
        paddingTop: space.md,
    },
    faqAnswer: {
        fontSize: text.bodySmall,
        color: color.textMuted,
        lineHeight: text.body * 1.4,
    },
    pressed: {
        opacity: 0.75,
    },
});

export default SettingsScreen;
