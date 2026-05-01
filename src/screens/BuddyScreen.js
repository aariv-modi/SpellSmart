import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';
import { scaleFont } from "../utils/responsiveTextSize";
import { getBookmarkedWords } from "../utils/HelperFunctions";
import { speak, stopSpeak } from "../utils/speak";

import ProgressBar from '../components/ProgressBar';
import RecursiveText from "../components/RecursiveText";
import BuddyCard from "../components/BuddyCard";

const { width, height } = Dimensions.get('window');

const BuddyScreen = ({ navigation, route }) => {
    const { list, listName } = route.params
    const words = useRef(list)
    const missedWords = useRef([])
    const [wordCounter, setWordCounter] = useState(0)
    const [bookmarked, setBookmarked] = useState(false)
    const [bookmarkedWords, setBookmarkedWords] = useState([])

    const getCurrentWord = () => words.current[wordCounter]

    const handleEnd = async () => {
        const data = JSON.parse(await AsyncStorage.getItem('userData'));
        await AsyncStorage.setItem('userData', JSON.stringify({
            ...data,
            bookmarkedWords,
            missedWords: [...new Set([...data.missedWords, ...missedWords.current])]
        }));

        navigation.reset({
            index: 0,
            routes: [{
                name: 'PracticeTab',
                state: { routes: [{ name: 'ListType' }] }
            }]
        });
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

    const handleWordProgress = (isCorrect) => {
        setWordCounter(prevCounter => {
            if (prevCounter >= words.current.length - 1) {
                handleEnd();
                return prevCounter;
            }

            if (!isCorrect) {
                missedWords.current = [...new Set([getCurrentWord(), ...missedWords.current])];
            }

            const newCounter = prevCounter + 1;
            speak(words.current[newCounter])
            return newCounter;
        });
    };

    useEffect(() => {
        const initializeScreen = async () => {
            try {
                const bookedWords = await getBookmarkedWords();
                setBookmarkedWords(bookedWords);
                setBookmarked(bookedWords.includes(getCurrentWord()));
                speak(getCurrentWord())
            } catch (error) {
                console.error("Initialization error:", error);
            }
        };

        initializeScreen();
        return stopSpeak;
    }, []);

    return (
        <View style={styles.container}>
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
                />
                <View style={styles.bookmarkContainer}>
                    <Ionicons
                        name={bookmarked ? "star" : "star-outline"}
                        size={height * 0.04}
                        color="#ffc800"
                        onPress={toggleBookmark}
                    />
                </View>
            </View>

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
                    onTouch={() => speak(getCurrentWord())}
                />
                <BuddyCard
                    text="Missed Words"
                    ionicon="trash-bin"
                    color="#1cb0f6"
                    onTouch={() => navigation.navigate("MissedWords", { incorrectWords: missedWords.current })}
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
    wordContainer: {
        height: height * 0.1,
        width: height * 0.39,
        marginTop: height * 0.02,
        justifyContent: 'center'
    },
    wordText: {
        alignSelf: 'center',
        fontSize: scaleFont(40)
    },
    bookmarkContainer: {
        position: 'absolute',
        top: height * 0.03,
        right: 0,
        justifyContent: 'center'
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