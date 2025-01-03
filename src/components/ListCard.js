import React, { useState } from "react";
import { StyleSheet, Dimensions, Pressable, View, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from '@expo/vector-icons'
import { updateListName, deleteList, getCustomListNames } from './../utils/HelperFunctions'
import RecursiveText from "./RecursiveText";
import InterText from "./InterText";
import { scaleFont } from "../utils/responsiveTextSize";

const { height } = Dimensions.get('window');

const CardButton = ({ icon, onPress }) => (
    <Pressable 
        onPress={onPress} 
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1.0 })}
    >
        <Ionicons 
            name={icon} 
            size={height * 0.029} 
            color="white" 
            style={icon === "create" ? styles.icon : null} 
        />
    </Pressable>
);

const RenameModal = ({ visible, onClose, value, onChange, onSubmit }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.modalContainer}>
                <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                        <RecursiveText text="Rename List" style={styles.modalTitle} />
                        <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={onChange}
                            placeholderTextColor="white"
                            placeholder="Enter new list name"
                            textAlign="center"
                            autoComplete="off"
                            autoCapitalize='none'
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={onSubmit}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    </Modal>
);

const DeleteModal = ({ visible, onClose, listName, onDelete }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <RecursiveText text="Delete List" style={styles.modalTitle} />
                <InterText
                    text={`Are you sure you want to delete ${listName}?`}
                    style={styles.deleteConfirmText}
                />
                <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={onDelete}
                    >
                        <InterText text="Yes" style={styles.modalButtonText} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={onClose}
                    >
                        <InterText text="Cancel" style={styles.modalButtonText} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

const ListCard = ({ title, length, onTouch, updateListNames, style = {} }) => {
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [newListName, setNewListName] = useState(title);

    const handleRename = async () => {
        await updateListName(title, newListName);
        setIsRenameModalVisible(false);
    };

    const handleDelete = async () => {
        await deleteList(newListName);
        updateListNames(await getCustomListNames());
        setIsDeleteModalVisible(false);
    };

    return (
        <>
            <Pressable 
                onPress={onTouch} 
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]}
            >
                <View style={[styles.card, { backgroundColor: '#333333' }, style]}>
                    <View style={styles.cardContent}>
                        <View style={styles.textContainer}>
                            <RecursiveText text={newListName} style={styles.listTitle} />
                            <RecursiveText text={`${length} words`} style={styles.listSubtitle} />
                        </View>
                        <View style={styles.iconContainer}>
                            <CardButton 
                                icon="create" 
                                onPress={() => setIsRenameModalVisible(true)} 
                            />
                            <CardButton 
                                icon="trash" 
                                onPress={() => setIsDeleteModalVisible(true)} 
                            />
                        </View>
                    </View>
                </View>
            </Pressable>

            <RenameModal
                visible={isRenameModalVisible}
                onClose={() => setIsRenameModalVisible(false)}
                value={newListName}
                onChange={setNewListName}
                onSubmit={handleRename}
            />

            <DeleteModal
                visible={isDeleteModalVisible}
                onClose={() => setIsDeleteModalVisible(false)}
                listName={newListName}
                onDelete={handleDelete}
            />
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        height: height * 0.08,
        width: height * 0.37,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowColor: '#030303',
        borderRadius: 15,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: height * 0.02
    },
    textContainer: {
        flexDirection: 'column'
    },
    listTitle: {
        fontSize: scaleFont(18),
        marginBottom: height * 0.005
    },
    listSubtitle: {
        fontSize: scaleFont(12),
        marginBottom: height * 0.005
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    icon: {
        marginRight: height * 0.01
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
    deleteConfirmText: {
        color: 'white',
        textAlign: 'center',
        marginBottom: height * 0.023
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: height * 0.34
    },
    modalButton: {
        backgroundColor: '#ce82ff',
        padding: 10,
        borderRadius: 10,
        width: '45%',
        alignItems: 'center'
    }
});

export default ListCard;