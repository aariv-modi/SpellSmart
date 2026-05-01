import React, { useState } from 'react'
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import TextRecognition from '@react-native-ml-kit/text-recognition'

import RecursiveText from '../components/RecursiveText'
import { addList, addWord } from '../utils/HelperFunctions'
import { scaleFont } from '../utils/responsiveTextSize'

const { width, height } = Dimensions.get('window')

const extractWords = (text) =>
    text
        .split(/\s+/)
        .map(w => w.replace(/^[^a-zA-Z]+|[^a-zA-Z'-]+$/g, ''))
        .filter(w => w.length > 1)

const UploadListScreen = ({ navigation }) => {
    const [words, setWords] = useState([])
    const [listName, setListName] = useState('')
    const [loading, setLoading] = useState(false)

    const pickAndOCR = async () => {
        const picked = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        })
        if (picked.canceled) return

        setLoading(true)
        try {
            const ocr = await TextRecognition.recognize(picked.assets[0].uri)
            const detected = extractWords(ocr.text)
            if (detected.length === 0) {
                Alert.alert('No text detected', 'Try a clearer or closer photo.')
                return
            }
            setWords(prev => Array.from(new Set([...prev, ...detected])))
        } catch (e) {
            Alert.alert('OCR failed', e?.message ?? 'Could not read the image.')
        } finally {
            setLoading(false)
        }
    }

    const removeWord = (word) => setWords(words.filter(w => w !== word))

    const saveList = async () => {
        const name = listName.trim()
        if (!name) {
            Alert.alert('Please enter a list name.')
            return
        }
        if (words.length === 0) {
            Alert.alert('Pick an image with words first.')
            return
        }
        await addList(name)
        for (const word of words) {
            await addWord(word, name)
        }
        navigation.navigate('ListDetails', { listName: name })
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.infoCard}>
                    <RecursiveText text="Upload Image" style={styles.infoTitle} />
                    <RecursiveText
                        text="Pick a photo of a word list and we'll extract the words on-device. Review and remove any mistakes, then save."
                        style={styles.infoText}
                    />
                </View>

                <TouchableOpacity style={styles.pickButton} onPress={pickAndOCR} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="image" size={height * 0.025} color="white" />
                            <RecursiveText text={words.length === 0 ? 'Pick Image' : 'Add Another Image'} style={styles.pickText} />
                        </>
                    )}
                </TouchableOpacity>

                {words.length > 0 && (
                    <View style={styles.wordsCard}>
                        <RecursiveText text={`${words.length} words found`} style={styles.wordsTitle} />
                        {words.map(word => (
                            <View key={word} style={styles.wordRow}>
                                <Text style={styles.word}>{word}</Text>
                                <TouchableOpacity onPress={() => removeWord(word)} hitSlop={10}>
                                    <Ionicons name="close-circle" size={height * 0.028} color="#ff6b6b" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TextInput
                            style={styles.input}
                            value={listName}
                            onChangeText={setListName}
                            placeholder="Name your list"
                            placeholderTextColor="#999"
                            autoCorrect={false}
                            autoCapitalize="none"
                            returnKeyType="done"
                            onSubmitEditing={saveList}
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={saveList}>
                            <RecursiveText text="Save List" style={styles.saveText} />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a1a' },
    scrollContent: { alignItems: 'center', paddingBottom: height * 0.08 },
    infoCard: {
        backgroundColor: '#333333',
        width: height * 0.415,
        borderRadius: 15,
        padding: height * 0.023,
        marginTop: height * 0.03,
    },
    infoTitle: {
        fontSize: scaleFont(20),
        marginBottom: height * 0.01,
        color: '#ffc107',
    },
    infoText: { fontSize: scaleFont(16), lineHeight: scaleFont(24) },
    pickButton: {
        backgroundColor: '#ce82ff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: height * 0.04,
        paddingVertical: height * 0.018,
        borderRadius: 25,
        marginTop: height * 0.03,
        minWidth: height * 0.25,
    },
    pickText: { color: 'white', fontSize: scaleFont(18), marginLeft: width * 0.03 },
    wordsCard: {
        backgroundColor: '#333333',
        width: height * 0.415,
        borderRadius: 15,
        padding: height * 0.023,
        marginTop: height * 0.025,
    },
    wordsTitle: {
        fontSize: scaleFont(18),
        marginBottom: height * 0.015,
        color: '#ffc107',
    },
    wordRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: height * 0.008,
        borderBottomColor: '#444',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    word: { color: 'white', fontSize: scaleFont(17) },
    input: {
        width: '100%',
        height: height * 0.05,
        backgroundColor: '#505050',
        color: 'white',
        borderRadius: 10,
        marginTop: height * 0.025,
        fontSize: scaleFont(16),
        paddingHorizontal: width * 0.04,
    },
    saveButton: {
        backgroundColor: '#ce82ff',
        paddingVertical: height * 0.015,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: height * 0.02,
    },
    saveText: { color: 'white', fontSize: scaleFont(18) },
})

export default UploadListScreen
