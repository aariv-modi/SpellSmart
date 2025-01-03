import React, { useState, useEffect } from "react"
import { View, StyleSheet, Dimensions, Modal, Text, TouchableOpacity, Animated, TouchableWithoutFeedback } from "react-native"

import { getBookmarkedWords, getCustomLists, getMissedWords } from "../utils/HelperFunctions"
import RecursiveText from "../components/RecursiveText"
import ListTypeCard from "../components/ListTypeCard"
import { scaleFont } from "../utils/responsiveTextSize"
import InterText from "../components/InterText"
import ListButton from "../components/ListButton"
import ModeCard from "../components/ModeCard"

const paintbrush = require('../../assets/images/paintbrush.png')
const uil = require('../../assets/images/uil.png')
const book = require('../../assets/images/book.png')
const flex = require('../../assets/images/flex.png')

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

const PracticeScreen = function ({ navigation }) {
    const [isModalVisible, setModalVisible] = useState(false);
    const [hasCustomLists, setHasCustomLists] = useState(false);
    const [hasBookmarks, setHasBookmarks] = useState(false);
    const [hasMissedWords, setHasMissedWords] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        checkAvailableLists();
    }, []);

    const checkAvailableLists = async () => {
        const customLists = await getCustomLists();
        const bookmarks = await getBookmarkedWords();
        const missedWords = await getMissedWords();

        setHasCustomLists(customLists.length > 0);
        setHasBookmarks(bookmarks.length > 0);
        setHasMissedWords(missedWords.length > 0);
    };

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

            <RecursiveText text='Practice' style={{ fontSize: scaleFont(36), marginTop: height * 0.1 }} />
            <RecursiveText text='List Type' style={{ fontSize: scaleFont(18), marginTop: height * 0.05 }} />
            <ListTypeCard
                title='UIL'
                image={uil}
                aspectRatio={1040 / 756}
                description={UILDescription}
                style={{ marginLeft: height * 0.014 }}
                onTouch={handleUILPress}
                disabled={false}
            />
            <RecursiveText text='Grade Level' style={{ fontSize: scaleFont(18), marginTop: height * 0.05 }} />
            <View style={styles.gradeButtonContainer}>
                {['3rd-4th', '5th-6th', '7th-8th'].map((grade) => (
                    <TouchableOpacity
                        key={grade}
                        style={[styles.gradeButton]}
                        onPress={() => handleGradeSelect(grade)}
                    >
                        <InterText text={grade} />
                    </TouchableOpacity>
                ))}
            </View>
            <RecursiveText text='List Name' style={{ fontSize: scaleFont(18), marginTop: height * 0.05 }} />
            <ListButton
                onPress={() => console.log('eh')}
                title={'hi guys'}
                numWords={50}
            />
            <RecursiveText text='Mode' style={{ fontSize: scaleFont(18), marginTop: height * 0.05 }} />
            <ModeCard
                title={'Solo'}
                //ionicon={config.icon}
                description={'howdy shlawgs'}
                onTouch={() => console.log('uhu')}
            />
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
                                <Text style={styles.modalTitle}>Select Your Grade Level</Text>

                                <View style={styles.gradeButtonContainer}>
                                    {['3rd-4th', '5th-6th', '7th-8th'].map((grade) => (
                                        <TouchableOpacity
                                            key={grade}
                                            style={[styles.gradeButton]}
                                            onPress={() => handleGradeSelect(grade)}
                                        >
                                            <InterText text={grade} />
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
        height: height,
        width: width,
        backgroundColor: "#1a1a1a",
        alignItems: 'center'
    },
    firstCardRow: {
        flexDirection: 'row',
        height: 0.3 * height,
        width: width,
        justifyContent: 'center',
        marginTop: height * 0.08,
        gap: height * 0.015
    },
    secondCardRow: {
        flexDirection: 'row',
        height: 0.3 * height,
        width: width,
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
        backgroundColor: '#333333',
        borderRadius: 20,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: scaleFont(20),
        fontWeight: 'bold',
        color: 'white',
        marginTop: height * 0.02
    },
    gradeButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: height * 0.34,
        marginTop: height * 0.02
    },
    gradeButton: {
        backgroundColor: '#505050',
        borderRadius: 10,
        width: height * 0.1,
        justifyContent: 'center',
        height: height * 0.04,
        alignItems: 'center'
    },
    warningContainer: {
        position: 'absolute',
        top: height * 0.07,
        backgroundColor: '#edcac8',
        borderRadius: 15,
        zIndex: 1000,
        width: height * 0.35,
        height: height * 0.07,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#d57b77',
        borderWidth: 2
    },
    warningText: {
        fontSize: scaleFont(14),
        color: '#cf645f'
    }
});

export default PracticeScreen