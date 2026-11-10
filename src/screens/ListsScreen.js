import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Modal, TextInput, Alert, TouchableWithoutFeedback, Pressable, Platform } from 'react-native';
import { getCustomListNames, getCustomListLengths, addList } from '../utils/HelperFunctions';
import RecursiveText from '../components/RecursiveText';
import InterText from '../components/InterText';
import { Ionicons } from '@expo/vector-icons';
import ListCard from '../components/ListCard';
import Card from '../components/ui/Card';
import { color, radii, space, text } from '../theme';

const { width, height } = Dimensions.get('window');
const CONTENT_WIDTH = height * 0.46;

// "From image" uses on-device ML Kit text recognition, which has no web version.
const PICKER_OPTIONS = [
    { key: 'type', icon: 'create-outline', label: 'Type words' },
    { key: 'image', icon: 'image-outline', label: 'From image' },
    { key: 'paste', icon: 'clipboard-outline', label: 'Paste from text' },
].filter((opt) => Platform.OS !== 'web' || opt.key !== 'image');

const ListsScreen = ({ navigation }) => {
    const [listNames, setListNames] = useState([]);
    const [listLengths, setListLengths] = useState([]);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [isNameModalVisible, setIsNameModalVisible] = useState(false);
    const [newListName, setNewListName] = useState('');

    const loadLists = useCallback(async () => {
        setListNames(await getCustomListNames());
        setListLengths(await getCustomListLengths());
    }, []);

    // Reload on focus so lists added or edited on other screens show up.
    useFocusEffect(
        useCallback(() => {
            loadLists();
        }, [loadLists])
    );

    const handlePick = (key) => {
        setIsPickerVisible(false);
        if (key === 'type') setIsNameModalVisible(true);
        else if (key === 'image') navigation.navigate('UploadList');
        else if (key === 'paste') navigation.navigate('PasteList');
    };

    const handleCreateList = async () => {
        const trimmed = newListName.trim();
        if (!trimmed) {
            Alert.alert('Please enter a name for your list.');
            return;
        }
        if (listNames.includes(trimmed)) {
            Alert.alert('A list with this name already exists.');
            return;
        }

        await addList(trimmed);
        await loadLists();
        setNewListName('');
        setIsNameModalVisible(false);
    };

    const handleCancelList = () => {
        setNewListName('');
        setIsNameModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {listNames.length === 0 ? (
                    <View style={styles.emptyState}>
                        <InterText
                            text="No custom lists yet — tap + to make one"
                            style={styles.emptyStateText}
                        />
                    </View>
                ) : (
                    <View style={styles.listsContainer}>
                        {listNames.map((item, index) => (
                            <ListCard
                                key={item}
                                onTouch={() => navigation.navigate('ListDetails', { listName: item })}
                                title={item}
                                length={listLengths[index]}
                                style={{ marginTop: space.md }}
                                onListsChanged={loadLists}
                            />
                        ))}
                    </View>
                )}

                <View style={{ height: height * 0.1 }} />
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setIsPickerVisible(true)}>
                <Ionicons name="add" size={height * 0.035} color={color.text} />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent
                visible={isPickerVisible}
                onRequestClose={() => setIsPickerVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsPickerVisible(false)}>
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <Card padding="md" style={styles.pickerCard}>
                                <RecursiveText text="Add a list" style={styles.pickerTitle} />
                                {PICKER_OPTIONS.map((opt) => (
                                    <Pressable
                                        key={opt.key}
                                        onPress={() => handlePick(opt.key)}
                                        style={({ pressed }) => [
                                            styles.pickerRow,
                                            pressed && styles.pickerRowPressed,
                                        ]}
                                    >
                                        <Ionicons name={opt.icon} size={22} color={color.text} />
                                        <InterText text={opt.label} style={styles.pickerRowText} />
                                    </Pressable>
                                ))}
                            </Card>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal
                animationType="slide"
                transparent
                visible={isNameModalVisible}
                onRequestClose={handleCancelList}
            >
                <TouchableWithoutFeedback onPress={handleCancelList}>
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <Card padding="lg" style={styles.namePromptCard}>
                                <RecursiveText text="Create New List" style={styles.namePromptTitle} />
                                <TextInput
                                    style={styles.input}
                                    value={newListName}
                                    onChangeText={setNewListName}
                                    placeholderTextColor={color.textSubtle}
                                    placeholder="Enter list name"
                                    textAlign="center"
                                    autoComplete="off"
                                    autoFocus
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    onSubmitEditing={handleCreateList}
                                />
                            </Card>
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
        backgroundColor: color.bg,
    },
    scrollContent: {
        alignItems: 'center',
        paddingTop: space.xl,
    },
    listsContainer: {
        width: CONTENT_WIDTH,
        alignItems: 'center',
    },
    emptyState: {
        width: CONTENT_WIDTH,
        paddingVertical: space.xxxl,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: text.body,
        color: color.textMuted,
    },
    fab: {
        position: 'absolute',
        width: height * 0.07,
        height: height * 0.07,
        borderRadius: radii.pill,
        backgroundColor: color.brandAlt,
        right: height * 0.03,
        bottom: height * 0.03,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: color.overlay,
        paddingHorizontal: space.xl,
    },
    pickerCard: {
        width: '100%',
        maxWidth: 400,
    },
    pickerTitle: {
        fontSize: text.title,
        alignSelf: 'center',
        marginBottom: space.md,
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.surface,
        paddingVertical: space.md,
        paddingHorizontal: space.lg,
        borderRadius: radii.md,
        marginTop: space.sm,
    },
    pickerRowPressed: {
        opacity: 0.75,
    },
    pickerRowText: {
        fontSize: text.body,
        marginLeft: space.md,
    },
    namePromptCard: {
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
    },
    namePromptTitle: {
        fontSize: text.title,
        marginBottom: space.lg,
    },
    input: {
        width: '100%',
        height: 48,
        backgroundColor: color.divider,
        color: color.text,
        borderRadius: radii.md,
        fontSize: text.body,
        fontFamily: 'Inter-SemiBold',
    },
});

export default ListsScreen;
