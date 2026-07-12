import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";

import { Ionicons } from '@expo/vector-icons';
import { scaleFont } from "../utils/responsiveTextSize";
import { getBookmarkedWords } from "../utils/HelperFunctions";
import { endSession } from "../utils/userData";
import { speak, stopSpeak } from "../utils/speak";
import { feedbackCorrect, feedbackIncorrect } from "../utils/sfx";

import ProgressBar from '../components/ProgressBar';
import RecursiveText from "../components/RecursiveText";
import BuddyCard from "../components/BuddyCard";
import FeedbackOverlay from '../components/FeedbackOverlay';
import DefinitionModal from '../components/DefinitionModal';

const { width, height } = Dimensions.get('window');

const BuddyScreen = ({ navigation, route }) => {
    const { list, listName } = route.params
    const words = useRef(list)
    const missedWords = useRef([])
    const startTime = useRef(Date.now())
    const [wordCounter, setWordCounter] = useState(0)
    const [bookmarked, setBookmarked] = useState(false)
    const [bookmarkedWords, setBookmarkedWords] = useState([])
    const feedbackTick = useRef(0)
    const [feedback, setFeedback] = useState({ type: null, tick: 0 })
    const busy = useRef(false)
    const [definitionVisible, setDefinitionVisible] = useState(false)

    const showFeedback = (type) => setFeedback({ type, tick: ++feedbackTick.current })
    const clearFeedback = () => setFeedback((prev) => ({ type: null, tick: prev.tick }))

    const getCurrentWord = () => words.current[wordCounter]

    const runAudio = async (audioPromise) => {
        busy.current = true;
        try {
            await audioPromise;
        } catch {
            // Swallow audio errors; never strand the UI in busy state.
        } finally {
            busy.current = false;
        }
    };

    const handleEnd = async (attemptedOverride) => {
        const wordsAttempted = attemptedOverride ?? wordCounter;
        const wordsCorrect = Math.max(0, wordsAttempted - missedWords.current.length);
        const missedFromSession = missedWords.current;

        await endSession({
            bookmarkedWords,
            missedFromSession,
            wordsAttempted,
            wordsCorrect,
            listName,
            mode: 'Buddy',
            durationMs: Date.now() - startTime.current,
        });

        navigation.reset({
            index: 1,
            routes: [
                { name: 'HomeMain' },
                {
                    name: 'EndSession',
                    params: { wordsAttempted, wordsCorrect, missedFromSession, listName, mode: 'Buddy' },
                },
            ],
        });
    };

    const toggleBookmark = () => {
        if (busy.current) return;
        const currentWord = getCurrentWord();
        setBookmarkedWords(prev => {
            if (bookmarked) {
                return prev.filter(word => word !== currentWord);
            }
            return [...prev, currentWord];
        });
        setBookmarked(!bookmarked);
    };

    const handleWordProgress = async (isCorrect) => {
        if (busy.current) return;
        busy.current = true;
        try {
            const currentCounter = wordCounter;
            const currentWord = words.current[currentCounter];

            if (!isCorrect) {
                missedWords.current = [...new Set([currentWord, ...missedWords.current])];
            }

            showFeedback(isCorrect ? 'correct' : 'incorrect');
            await (isCorrect ? feedbackCorrect() : feedbackIncorrect());

            if (currentCounter >= words.current.length - 1) {
                handleEnd(currentCounter + 1);
                return;
            }

            const newCounter = currentCounter + 1;
            setWordCounter(newCounter);
            await speak(words.current[newCounter]);
        } catch {
            // Swallow audio errors; never strand the UI in busy state.
        } finally {
            busy.current = false;
        }
    };

    useEffect(() => {
        const initializeScreen = async () => {
            try {
                const bookedWords = await getBookmarkedWords();
                setBookmarkedWords(bookedWords);
                setBookmarked(bookedWords.includes(getCurrentWord()));
                runAudio(speak(getCurrentWord()));
            } catch (error) {
                console.error("Initialization error:", error);
            }
        };

        initializeScreen();
        return stopSpeak;
    }, []);

    return (
        <View style={styles.container}>
            <FeedbackOverlay type={feedback.type} tick={feedback.tick} onDone={clearFeedback} />
            <View style={styles.progressContainer}>
                <ProgressBar progress={wordCounter / list.length} />
                <RecursiveText
                    text={`${wordCounter} / ${list.length}`}
                    style={styles.progressText}
                />
            </View>

            <View style={styles.wordContainer}>
                <RecursiveText
                    text={getCurrentWord()}
                    style={styles.wordText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.4}
                />
                <View style={styles.bookmarkContainer}>
                    <Ionicons
                        name="book-outline"
                        size={height * 0.04}
                        color="white"
                        style={styles.definitionIcon}
                        onPress={() => {
                            if (busy.current) return;
                            setDefinitionVisible(true);
                        }}
                    />
                    <Ionicons
                        name={bookmarked ? "star" : "star-outline"}
                        size={height * 0.04}
                        color="#ffc800"
                        onPress={toggleBookmark}
                    />
                </View>
            </View>

            <DefinitionModal
                word={getCurrentWord()}
                visible={definitionVisible}
                onClose={() => setDefinitionVisible(false)}
            />

            <View style={styles.buddyCardContainer}>
                <BuddyCard
                    text="Incorrect"
                    ionicon="close"
                    color="#ff4b4b"
                    onTouch={() => handleWordProgress(false)}
                />
                <BuddyCard
                    text="Correct"
                    ionicon="checkmark"
                    color="#89e219"
                    onTouch={() => handleWordProgress(true)}
                />
            </View>

            <View style={styles.additionalCardContainer}>
                <BuddyCard
                    text="Repeat"
                    ionicon="volume-high"
                    color="#ffc800"
                    onTouch={() => {
                        if (busy.current) return;
                        runAudio(speak(getCurrentWord()));
                    }}
                />
                <BuddyCard
                    text="Missed Words"
                    ionicon="trash-bin"
                    color="#1cb0f6"
                    onTouch={() => {
                        if (busy.current) return;
                        navigation.navigate("MissedWords", { incorrectWords: missedWords.current });
                    }}
                />
            </View>

            <Pressable
                onPress={() => {
                    if (busy.current) return;
                    handleEnd();
                }}
                style={({ pressed }) => [styles.endButton, pressed && styles.endButtonPressed]}
            >
                <RecursiveText text="END" style={styles.endButtonText} />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: height * 0.82,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center'
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: height * 0.405,
        justifyContent: 'space-between'
    },
    progressText: {
        fontSize: scaleFont(24)
    },
    wordContainer: {
        height: height * 0.1,
        width: height * 0.39,
        marginTop: height * 0.02,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    wordText: {
        flex: 1,
        marginRight: height * 0.015,
        fontSize: scaleFont(40)
    },
    bookmarkContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    definitionIcon: {
        marginRight: height * 0.018,
        marginTop: height * 0.005
    },
    buddyCardContainer: {
        flexDirection: 'row',
        height: height * 0.185,
        width: height * 0.44,
        justifyContent: 'space-evenly',
        marginTop: height * 0.02,
    },
    additionalCardContainer: {
        flexDirection: 'row',
        height: height * 0.185,
        width: height * 0.44,
        justifyContent: 'space-evenly',
        marginTop: height * 0.02
    },
    endButton: {
        height: height * 0.07,
        width: height * 0.15,
        backgroundColor: '#ff4b4b',
        marginTop: height * 0.04,
        borderRadius: 10,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    endButtonPressed: {
        opacity: 0.5
    },
    endButtonText: {
        alignSelf: 'center',
        fontSize: scaleFont(24)
    }
});

export default BuddyScreen;