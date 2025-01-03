import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Modal, TextInput, Alert, TouchableWithoutFeedback } from 'react-native';
import { getCustomListNames, getCustomListLengths, addList } from '../utils/HelperFunctions';
import RecursiveText from "../components/RecursiveText"
import { Ionicons } from '@expo/vector-icons'
import ListCard from '../components/ListCard'
import { scaleFont } from '../utils/responsiveTextSize';
const { width, height } = Dimensions.get('window');

const ListsScreen = ({ navigation }) => {
    const [listNames, setListNames] = useState([]);
    const [listLengths, setListLengths] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newListName, setNewListName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const listNames = await getCustomListNames();
            setListNames(listNames);
            const listLengths = await getCustomListLengths();
            setListLengths(listLengths)
        };
        fetchData();
    }, [listNames]);

    const handleAddButtonPress = () => {
        setIsModalVisible(true);
    };

    const handleCreateList = async () => {
        const trimmedListName = newListName.trim();

        if (!trimmedListName) {
            Alert.alert('Please enter a name for your list.');
            return;
        }

        if (listNames.includes(trimmedListName)) {
            Alert.alert('A list with this name already exists.');
            return;
        }

        await addList(trimmedListName);
        setListNames([...listNames, trimmedListName]);
        setNewListName('');
        setIsModalVisible(false);
    };

    const handleCancelList = () => {
        setNewListName('');
        setIsModalVisible(false);
    };

    const renderListItems = () => {
        return listNames.map((item, index) => (
            <ListCard
                key={item}
                onTouch={() => navigation.navigate('ListDetails', { listName: item })}
                title={item}
                length={listLengths[index]}
                style={{ marginTop: height * 0.015 }}
                updateListNames={setListNames}
            />
        ));
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.infoCard}>
                    <RecursiveText
                        text="Your Lists"
                        style={styles.infoTitle}
                    />
                    <RecursiveText
                        text="Here's where you can view and manage your custom spelling lists! Click on a list to view and edit its contents, or click the + button to create a new one."
                        style={styles.infoText}
                    />
                </View>
                <View style={styles.missedWordsDivider} />
                <View style={styles.listsContainer}>
                    {renderListItems()}
                </View>
                {/* Add some padding at the bottom for better scrolling */}
                <View style={{ height: height * 0.1 }} />
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={handleAddButtonPress}>
                <Ionicons name="add" size={height * 0.035} color="white" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={handleCancelList}
            >
                <TouchableWithoutFeedback onPress={handleCancelList}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>

                            <View style={styles.modalContent}>
                                <RecursiveText text="Create New List" style={styles.modalTitle} />

                                <TextInput
                                    style={styles.input}
                                    value={newListName}
                                    onChangeText={setNewListName}
                                    placeholderTextColor="white"
                                    placeholder="Enter list name"
                                    textAlign="center"
                                    autoComplete="off"
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    onSubmitEditing={handleCreateList}
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
    },
    scrollContent: {
        alignItems: 'center',
    },
    listsContainer: {
        width: height * 0.46,
        alignItems: 'center',
        marginTop: height * 0.02,
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
    infoCard: {
        backgroundColor: '#333333',
        width: height * 0.415,
        borderRadius: 15,
        padding: height * 0.023,
        marginTop: height * 0.03
    },
    infoTitle: {
        fontSize: scaleFont(20),
        marginBottom: height * 0.01,
        color: '#ffc107'
    },
    infoText: {
        fontSize: scaleFont(16),
        lineHeight: scaleFont(24)
    },
    missedWordsDivider: {
        height: height * 0.004,
        width: height * 0.4,
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 30,
        marginTop: height * 0.02
    },
});

export default ListsScreen;