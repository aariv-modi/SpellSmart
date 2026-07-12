import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import InterText from '../components/InterText';
import RecursiveText from '../components/RecursiveText';
import Confetti from '../components/Confetti';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { color, space, text } from '../theme';

const { width } = Dimensions.get('window');
const CONTENT_WIDTH = width * 0.85;

const HEADLINES_HIGH = ['Great job!', 'Spell champion!', 'Nailed it!', 'You crushed it!'];
const HEADLINES_MID = ['Solid effort!', 'Keep going!', 'Nice progress!', 'Good work!'];
const HEADLINES_LOW = ['Practice makes perfect!', 'Every try counts!', 'Keep at it!', "You'll get it!"];

const pickHeadline = (accuracyPct) => {
    const pool = accuracyPct >= 80 ? HEADLINES_HIGH : accuracyPct >= 50 ? HEADLINES_MID : HEADLINES_LOW;
    return pool[Math.floor(Math.random() * pool.length)];
};

const EndSessionScreen = ({ navigation, route }) => {
    const { wordsAttempted, wordsCorrect, missedFromSession, listName, mode } = route.params;
    const accuracyPct = wordsAttempted === 0 ? 0 : Math.round((wordsCorrect / wordsAttempted) * 100);
    const missedCount = missedFromSession?.length ?? 0;
    const headline = useRef(pickHeadline(accuracyPct)).current;

    const handlePracticeMissed = () => {
        navigation.replace(mode, {
            list: missedFromSession,
            listName: `Missed from ${listName}`,
        });
    };

    const handleDone = () => navigation.popToTop();

    return (
        <View style={styles.container}>
            <Confetti />

            <View style={styles.content}>
                <InterText text={headline} style={styles.headline} />

                <Card padding="lg" style={styles.statsCard}>
                    <RecursiveText
                        text={`${wordsCorrect} / ${wordsAttempted}`}
                        style={styles.score}
                    />
                    <InterText text="words right" style={styles.scoreLabel} />
                    <InterText text={`${accuracyPct}% accuracy`} style={styles.accuracy} />
                    {missedCount > 0 && (
                        <InterText
                            text={`Missed ${missedCount} word${missedCount === 1 ? '' : 's'}`}
                            style={styles.missed}
                        />
                    )}
                </Card>

                {missedCount > 0 && (
                    <Button
                        label={`Practice the ${missedCount} missed word${missedCount === 1 ? '' : 's'}`}
                        onPress={handlePracticeMissed}
                        style={styles.primaryCta}
                    />
                )}

                <Button label="Back to lists" variant="ghost" onPress={handleDone} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.bg,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: space.xl,
    },
    headline: {
        fontSize: text.display,
        marginBottom: space.xl,
    },
    statsCard: {
        width: CONTENT_WIDTH,
        alignItems: 'center',
        marginBottom: space.xl,
    },
    score: {
        fontSize: text.display * 1.5,
    },
    scoreLabel: {
        fontSize: text.bodySmall,
        color: color.textMuted,
        marginTop: space.xs,
    },
    accuracy: {
        fontSize: text.title,
        color: color.accent,
        marginTop: space.lg,
    },
    missed: {
        fontSize: text.bodySmall,
        color: color.textMuted,
        marginTop: space.md,
    },
    primaryCta: {
        width: CONTENT_WIDTH,
        marginBottom: space.md,
    },
});

export default EndSessionScreen;
