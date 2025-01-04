import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Dimensions, TouchableWithoutFeedback, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getList, deleteWord, addWord } from '../utils/HelperFunctions';
import RecursiveText from '../components/RecursiveText';
import InterText from '../components/InterText';
import { scaleFont } from '../utils/responsiveTextSize';

const { width, height } = Dimensions.get('window');

const ListDetailsScreen = ({ navigation, route }) => {
    const { listName } = route.params;
    const [words, setWords] = useState([]);
    const [newWord, setNewWord] = useState('');
    const [isAddWordModalVisible, setIsAddWordModalVisible] = useState(false);

    const handleDeleteWord = useCallback(async (wordToDelete) => {
        await deleteWord(wordToDelete, listName);
        setWords(words.filter(word => word !== wordToDelete));
    }, [words, listName]);

    // Function to add a new word
    const handleAddWord = useCallback(async () => {
        const trimmedWord = newWord.trim();
        if (trimmedWord && !words.includes(trimmedWord)) {
            setWords([...words, trimmedWord]);
            await addWord(trimmedWord, listName);
            setNewWord('');
            setIsAddWordModalVisible(false);
        }
        else if (!trimmedWord) {
            Alert.alert('Please enter a word');
        }
        else {
            Alert.alert('This word already exists!');
        }
    }, [newWord, words, listName]);

    // Close modal and reset new word
    const closeModal = useCallback(() => {
        setIsAddWordModalVisible(false);
        setNewWord('');
    }, []);

    useFocusEffect(
        useCallback(() => {
            const fetchList = async () => {
                setWords(await getList(listName));
            };
            fetchList();
        }, [listName])
    );

    const renderListItems = () => {
        return words.map((item, key) => (
            <TouchableOpacity style={styles.wordItem} key={item}>
                <InterText style={styles.wordText} text={`${key + 1}.     ${item}`} />
                <Ionicons name="close" size={20} color="white" onPress={() => handleDeleteWord(item)} />
            </TouchableOpacity>
        ));
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ alignItems: 'center' }}
            >
                <View style={styles.listContainer}>
                    {renderListItems()}
                </View>
                {/* Add some padding at the bottom for better scrolling */}
                <View style={{ height: height * 0.1 }} />
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setIsAddWordModalVisible(true)}>
                <Ionicons name="add" size={height * 0.035} color="white" />
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isAddWordModalVisible}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <RecursiveText text="Add New Word" style={styles.modalTitle} />

                                <TextInput
                                    style={styles.input}
                                    value={newWord}
                                    onChangeText={setNewWord}
                                    placeholderTextColor="white"
                                    placeholder="Enter a new word"
                                    textAlign="center"
                                    autoComplete="off"
                                    autoFocus={true}
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    onSubmitEditing={handleAddWord}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a1a",
        alignItems: 'center'
    },
    listContainer: {
        marginTop: height * 0.01,
        width: height * 0.415,
    },
    wordItem: {
        backgroundColor: '#2c2c2c',
        padding: 15,
        borderRadius: 10,
        marginTop: height * 0.015,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    wordText: {
        fontSize: scaleFont(18)
    },
    fab: {
        position: 'absolute',
        width: height * 0.07,
        height: height * 0.07,
        borderRadius: 100,
        backgroundColor: '#ce82ff',
        right: height * 0.03,
        bottom: height * 0.03, // Changed from top to bottom
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        width: height * 0.37,
        height: height * 0.16,
        backgroundColor: '#333333',
        borderRadius: 20,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: scaleFont(20),
        marginTop: height * 0.025,
    },
    input: {
        width: height * 0.32,
        height: height * 0.05,
        backgroundColor: '#505050',
        color: 'white',
        borderRadius: 10,
        marginTop: height * 0.025,
        fontSize: scaleFont(16)
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    modalButton: {
        backgroundColor: '#1e90ff',
        padding: 10,
        borderRadius: 10,
        width: '45%',
        alignItems: 'center'
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold'
    }
});

export default ListDetailsScreen;