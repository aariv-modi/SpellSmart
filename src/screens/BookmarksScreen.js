import React, { useState, useEffect } from 'react';
import { View, Dimensions, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { unbookmarkWord, bookmarkWord, getBookmarkedWords } from '../utils/HelperFunctions';
import InterText from '../components/InterText';
import RecursiveText from '../components/RecursiveText';
import { scaleFont } from '../utils/responsiveTextSize';

const { width, height } = Dimensions.get('window');

const BookmarksScreen = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [newBookmark, setNewBookmark] = useState('');
    const [isAddBookmarkModalVisible, setIsAddBookmarkModalVisible] = useState(false);

    // Function to delete a bookmark from the list
    const handleDeleteBookmark = async (bookmarkToDelete) => {
        setBookmarks(bookmarks.filter(bookmark => bookmark !== bookmarkToDelete));
        await unbookmarkWord(bookmarkToDelete);
    };

    // Function to add a new bookmark
    const handleAddBookmark = async () => {
        setBookmarks([...bookmarks, newBookmark.trim()]);
        await bookmarkWord(newBookmark);
        setNewBookmark('');
        setIsAddBookmarkModalVisible(false);
    };

    useEffect(() => {
        const fetchList = async () => {
            setBookmarks(await getBookmarkedWords());
        };
        fetchList();
    }, []);

    const renderListItems = () => {
        return bookmarks.map((item, index) => (
            <View style={styles.bookmarkItem} key={index}>
                <InterText style={styles.bookmarkText} text={item} />
                <Ionicons name="close" size={height * 0.023} color="white" onPress={() => handleDeleteBookmark(item)} />
            </View>
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
                <View style={{ height: height * 0.1 }} />
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setIsAddBookmarkModalVisible(true)}>
                <Ionicons name="add" size={height * 0.035} color="white" />
            </TouchableOpacity>


            <Modal
                animationType="slide"
                transparent={true}
                visible={isAddBookmarkModalVisible}
            >
                <TouchableWithoutFeedback onPress={() => {
                    setIsAddBookmarkModalVisible(false)
                    setNewBookmark('')
                }}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>

                            <View style={styles.modalContent}>
                                <RecursiveText text="Add New Bookmark" style={styles.modalTitle} />

                                <TextInput
                                    style={styles.input}
                                    value={newBookmark}
                                    onChangeText={setNewBookmark}
                                    placeholderTextColor="white"
                                    placeholder="Enter a new bookmark"
                                    textAlign="center"
                                    autoComplete="off"
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    autoFocus={true}
                                    returnKeyType="done"
                                    onSubmitEditing={handleAddBookmark}
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
        height: height * 0.7,
        marginTop: height * 0.01,
        width: height * 0.415
    },
    bookmarkItem: {
        backgroundColor: '#2c2c2c',
        padding: 15,
        borderRadius: 10,
        marginTop: height * 0.015,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    bookmarkText: {
        fontSize: scaleFont(18)
    },
    fab: {
        position: 'absolute',
        width: height * 0.07,
        height: height * 0.07,
        borderRadius: 100,
        backgroundColor: '#ff9600',
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
    }
});

export default BookmarksScreen;