import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, Dimensions, FlatList, Pressable } from "react-native";

import { Ionicons } from '@expo/vector-icons';
import { scaleFont } from "../utils/responsiveTextSize";
import { getBookmarkedWords } from "../utils/HelperFunctions";
import { endSession } from "../utils/userData";
import { speak, stopSpeak } from "../utils/speak";
import { feedbackCorrect, feedbackIncorrect } from "../utils/sfx";

import ProgressBar from '../components/ProgressBar';
import RecursiveText from "../components/RecursiveText";
import InterText from '../components/InterText';
import FeedbackOverlay from '../components/FeedbackOverlay';
import DefinitionModal from '../components/DefinitionModal';

const { width, height } = Dimensions.get('window');

const SoloScreen = ({ navigation, route }) => {
    const { list, listName } = route.params;
    const wordCounter = useRef(0);
    const words = useRef(list);
    const startTime = useRef(Date.now());
    const [missedWords, setMissedWords] = useState([]);
    const [userSpelling, setUserSpelling] = useState("");
    const [bookmarked, setBookmarked] = useState(false);
    const [bookmarkedWords, setBookmarkedWords] = useState([]);
    const feedbackTick = useRef(0);
    const [feedback, setFeedback] = useState({ type: null, tick: 0 });
    const [busy, setBusy] = useState(false);
    const busyRef = useRef(false);
    const [definitionVisible, setDefinitionVisible] = useState(false);

    const showFeedback = (type) => setFeedback({ type, tick: ++feedbackTick.current });
    const clearFeedback = () => setFeedback((prev) => ({ type: null, tick: prev.tick }));

    const getCurrentWord = () => words.current[wordCounter.current];

    const spellWord = async (word) => {
        return speak(`<speak>${word.split('')}</speak>`);
    };

    const handleCorrectSpelling = async () => {
        showFeedback('correct');
        await feedbackCorrect();

        wordCounter.current += 1;

        if (wordCounter.current >= words.current.length) {
            return handleEnd();
        }

        const nextWord = getCurrentWord();
        setBookmarked(bookmarkedWords.includes(nextWord));
        setUserSpelling("");
        await speak(nextWord);
    };

    const handleIncorrectSpelling = async (currentWord) => {
        setMissedWords(prev => [...new Set([...prev, currentWord])]);
        setUserSpelling("");
        showFeedback('incorrect');
        await feedbackIncorrect();

        await speak(`${currentWord} is spelled`);
        await spellWord(currentWord);
        await speak('Try again.');
    };

    const checkSpelling = async () => {
        if (busyRef.current) return;
        busyRef.current = true;
        setBusy(true);
        try {
            const currentWord = getCurrentWord();
            const isCorrect = userSpelling.trim().toLowerCase() === currentWord.toLowerCase();

            if (isCorrect) {
                await handleCorrectSpelling();
            } else {
                await handleIncorrectSpelling(currentWord);
            }
        } finally {
            busyRef.current = false;
            setBusy(false);
        }
    };

    const toggleBookmark = () => {
        const currentWord = getCurrentWord();
        setBookmarkedWords(prev => {
            if (bookmarked) {
                return prev.filter(word => word !== currentWord);
            }
            return [...prev, currentWord];
        });
        setBookmarked(!bookmarked);
    };

    const handleEnd = async () => {
        const wordsAttempted = wordCounter.current;
        const wordsCorrect = Math.max(0, wordsAttempted - missedWords.length);

        await endSession({
            bookmarkedWords,
            missedFromSession: missedWords,
            wordsAttempted,
            wordsCorrect,
            listName,
            mode: 'Solo',
            durationMs: Date.now() - startTime.current,
        });

        navigation.reset({
            index: 1,
            routes: [
                { name: 'HomeMain' },
                {
                    name: 'EndSession',
                    params: { wordsAttempted, wordsCorrect, missedFromSession: missedWords, listName, mode: 'Solo' },
                },
            ],
        });
    };

    useEffect(() => {
        const initializeScreen = async () => {
            const bookedWords = await getBookmarkedWords();
            setBookmarkedWords(bookedWords);

            const currentWord = getCurrentWord();
            setBookmarked(bookedWords.includes(currentWord));

            await speak('Your first word is:');
            await speak(currentWord);
        };

        initializeScreen();
        return stopSpeak;
    }, []);

    const renderMissedWord = ({ item }) => (
        <InterText text={item} style={styles.missedWordItem} />
    );

    return (
        <View style={styles.container}>
            <FeedbackOverlay type={feedback.type} tick={feedback.tick} onDone={clearFeedback} />
            <View style={styles.progressContainer}>
                <ProgressBar progress={wordCounter.current / list.length} />
                <RecursiveText
                    text={`${wordCounter.current} / ${list.length}`}
                    style={styles.progressText}
                />
            </View>

            <View style={[styles.textInputContainer, busy && styles.textInputContainerBusy]}>
                <TextInput
                    autoComplete="off"
                    autoCapitalize='none'
                    autoCorrect={false}
                    placeholder="Enter here"
                    placeholderTextColor="white"
                    onChangeText={setUserSpelling}
                    value={userSpelling}
                    returnKeyType="done"
                    onSubmitEditing={checkSpelling}
                    editable={!busy}
                    style={styles.textInputField}
                />
                <View style={styles.iconContainer}>
                    <Ionicons
                        name="volume-high"
                        size={height * 0.033}
                        color="white"
                        style={styles.volumeIcon}
                        onPress={() => speak(getCurrentWord())}
                    />
                    <Ionicons
                        name="book-outline"
                        size={height * 0.033}
                        color="white"
                        style={styles.volumeIcon}
                        onPress={() => setDefinitionVisible(true)}
                    />
                    <Ionicons
                        name={bookmarked ? "star" : "star-outline"}
                        size={height * 0.033}
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

            <View style={styles.missedWordsContainer}>
                <RecursiveText text="MISSED WORDS" style={styles.title} />
                <View style={styles.missedWordsDivider} />
                <FlatList
                    style={styles.missedWordsList}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={item => item}
                    data={missedWords}
                    renderItem={renderMissedWord}
                />
            </View>

            <Pressable 
                onPress={handleEnd} 
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
    textInputContainer: {
        marginTop: height * 0.04,
        backgroundColor: '#505050',
        height: height * 0.07,
        width: height * 0.415,
        borderRadius: 10,
        justifyContent: 'center'
    },
    textInputContainerBusy: {
        opacity: 0.5
    },
    textInputField: {
        fontSize: scaleFont(16),
        fontFamily: 'Inter-SemiBold',
        marginLeft: height * 0.018,
        color: 'white'
    },
    iconContainer: {
        flexDirection: 'row',
        position: 'absolute',
        right: height * 0.018,
    },
    volumeIcon: {
        marginRight: height * 0.023
    },
    missedWordsContainer: {
        height: height * 0.45,
        width: height * 0.415,
        borderRadius: 15,
        backgroundColor: '#333333',
        marginTop: height * 0.03
    },
    missedWordsDivider: {
        height: height * 0.004,
        width: height * 0.28,
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 30
    },
    missedWordsList: {
        marginTop: height * 0.02
    },
    missedWordItem: {
        alignSelf: 'center',
        fontSize: scaleFont(18),
        marginTop: height * 0.001
    },
    endButton: {
        height: height * 0.07,
        width: height * 0.15,
        backgroundColor: '#ff4b4b',
        marginTop: height * 0.03,
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
    },
    title: {
        alignSelf: 'center',
        fontSize: scaleFont(32),
        marginTop: height * 0.015
    }
});

export default SoloScreen;