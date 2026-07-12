import React, { useState, useEffect, useCallback } from "react"
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, Dimensions, Modal, TouchableOpacity, Animated, TouchableWithoutFeedback } from "react-native"
import { getBookmarkedWords, getCustomLists, getMissedWords } from "../utils/HelperFunctions"
import ListTypeCard from "../components/ListTypeCard"
import { scaleFont } from "../utils/responsiveTextSize"
import InterText from "../components/InterText"

const paintbrush = require('../../assets/images/paintbrush.png')
const uil = require('../../assets/images/uil.png')
const book = require('../../assets/images/book.png')
const flex = require('../../assets/images/flex.png')

const colors = {
    primary: {
        main: '#58cc02'
    },
    neutral: {
        offWhite: '#F5F5F5',
        darkGray: '#424242',
    }
}

const UILDescription = 'These lists are made for UIL competitors, but are fantastic for anyone to practice with!'
const customDescription = 'Here you can play any lists you\'ve created in the past!';
const bookmarksDescription = 'Review over all the words you\'ve previously bookmarked!';
const missedWordsDescription = 'Practice words that you struggled with earlier!';

const { width, height } = Dimensions.get('window');

const WarningNotification = ({ message, visible, onHide }) => {
    const opacity = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(1250),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => onHide());
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.warningContainer, { opacity }]}>
            <InterText text={message} style={styles.warningText} />
        </Animated.View>
    );
};

const ListTypeScreen = function ({ navigation }) {
    const [isModalVisible, setModalVisible] = useState(false);
    const [hasCustomLists, setHasCustomLists] = useState(false);
    const [hasBookmarks, setHasBookmarks] = useState(false);
    const [hasMissedWords, setHasMissedWords] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [showWarning, setShowWarning] = useState(false);

    const checkAvailableLists = async () => {
        const customLists = await getCustomLists();
        const bookmarks = await getBookmarkedWords();
        const missedWords = await getMissedWords();

        setHasCustomLists(customLists.length > 0);
        setHasBookmarks(bookmarks.length > 0);
        setHasMissedWords(missedWords.length > 0);
    };

    useFocusEffect(
        useCallback(() => {
            checkAvailableLists();
        }, [])
    );

    const showWarningMessage = (message) => {
        setWarningMessage(message);
        setShowWarning(true);
    };

    const handleCustomPress = async () => {
        if (!hasCustomLists) {
            showWarningMessage("You haven't made any custom lists yet!");
            return;
        }
        navigation.navigate("ListSelection", { listType: 'Custom' });
    }

    const handleBookmarksPress = async () => {
        if (!hasBookmarks) {
            showWarningMessage("You haven't bookmarked any words yet!");
            return;
        }
        navigation.navigate("ModeSelection", { listName: 'Bookmarks', list: await getBookmarkedWords() });
    }

    const handleMissedWordsPress = async () => {
        if (!hasMissedWords) {
            showWarningMessage("You haven't missed any words yet!");
            return;
        }
        navigation.navigate("ModeSelection", { listName: 'Missed Words', list: await getMissedWords() });
    }

    const handleUILPress = () => {
        setModalVisible(true);
    }

    const handleGradeSelect = (grade) => {
        navigation.navigate("ListSelection", {
            listType: 'UIL',
            gradeLevel: grade
        });
        setModalVisible(false);
    }

    const handleModalClose = () => {
        setModalVisible(false);
    }

    return (
        <View style={styles.container}>
            <WarningNotification
                message={warningMessage}
                visible={showWarning}
                onHide={() => setShowWarning(false)}
            />

            <View style={styles.firstCardRow}>
                <ListTypeCard
                    title='UIL'
                    image={uil}
                    aspectRatio={1040 / 756}
                    description={UILDescription}
                    style={{ marginLeft: height * 0.014 }}
                    onTouch={handleUILPress}
                    disabled={false}
                />
                <ListTypeCard
                    title='CUSTOM'
                    image={paintbrush}
                    aspectRatio={379 / 357}
                    description={customDescription}
                    style={{ marginRight: height * 0.014 }}
                    onTouch={handleCustomPress}
                    disabled={!hasCustomLists}
                />
            </View>
            <View style={styles.secondCardRow}>
                <ListTypeCard
                    title='BOOKMARKS'
                    image={book}
                    aspectRatio={374 / 296}
                    description={bookmarksDescription}
                    style={{ marginLeft: width * 0.03 }}
                    onTouch={handleBookmarksPress}
                    disabled={!hasBookmarks}
                />
                <ListTypeCard
                    title='MISSED WORDS'
                    image={flex}
                    aspectRatio={387 / 355}
                    description={missedWordsDescription}
                    style={{ marginRight: width * 0.03 }}
                    onTouch={handleMissedWordsPress}
                    disabled={!hasMissedWords}
                />
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={handleModalClose}
            >
                <TouchableWithoutFeedback onPress={handleModalClose}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <InterText text="Select Your Grade Level" style={styles.modalTitle} />
                                <View style={styles.gradeButtonContainer}>
                                    {['3rd-4th', '5th-6th', '7th-8th'].map((grade) => (
                                        <TouchableOpacity
                                            key={grade}
                                            style={[styles.gradeButton]}
                                            onPress={() => handleGradeSelect(grade)}
                                        >
                                            <InterText text={grade} style={styles.gradeButtonText} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: height * 0.72,
        width: width,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    firstCardRow: {
        flexDirection: 'row',
        height: 0.3 * height,
        justifyContent: 'center',
        gap: height * 0.015
    },
    secondCardRow: {
        flexDirection: 'row',
        height: 0.3 * height,
        justifyContent: 'center',
        marginTop: height * 0.01,
        gap: height * 0.015
    },
    modalContainer: {
        height: height,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        width: 0.37 * height,
        height: 0.13 * height,
        backgroundColor: true ? '#333333' : 'white',
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: scaleFont(20),
        fontWeight: 'bold',
        color: true ? 'white' : '#424242',
        marginTop: height * 0.02
    },
    gradeButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: height * 0.34,
        marginTop: height * 0.02
    },
    gradeButton: {
        backgroundColor: colors.primary.main,
        borderRadius: 10,
        width: height * 0.1,
        justifyContent: 'center',
        height: height * 0.04,
        alignItems: 'center'
    },
    gradeButtonText: {
        color: 'white',
        fontSize: scaleFont(14)
    },
    warningContainer: {
        position: 'absolute',
        top: height * 0.02,
        backgroundColor: '#FFF3E0',
        borderRadius: 15,
        zIndex: 1000,
        width: height * 0.35,
        height: height * 0.07,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#FFA726',
        borderWidth: 2
    },
    warningText: {
        fontSize: scaleFont(14),
        color: colors.neutral.darkGray
    }
});

export default ListTypeScreen