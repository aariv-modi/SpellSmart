import React, { useState, useMemo } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Dimensions,
    Pressable,
    ScrollView,
    Alert,
} from 'react-native';
import InterText from '../components/InterText';
import RecursiveText from '../components/RecursiveText';
import { addListWithWords, uniqueListName } from '../utils/HelperFunctions';
import { scaleFont } from '../utils/responsiveTextSize';

const { width, height } = Dimensions.get('window');

const parseWords = (text) =>
    text
        .split(/[\s,;]+/)
        .map((w) => w.trim())
        .filter(Boolean);

const PasteListScreen = ({ navigation }) => {
    const [listName, setListName] = useState('');
    const [pasted, setPasted] = useState('');

    const parsedWords = useMemo(() => {
        const all = parseWords(pasted);
        return [...new Set(all)];
    }, [pasted]);

    const handleSave = async () => {
        const trimmedName = listName.trim();
        if (!trimmedName) {
            Alert.alert('Please enter a name for your list.');
            return;
        }
        if (parsedWords.length === 0) {
            Alert.alert('Paste some words first.');
            return;
        }

        const finalName = await uniqueListName(trimmedName);
        await addListWithWords(finalName, parsedWords);
        navigation.navigate('ListDetails', { listName: finalName });
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <InterText text="List name" style={styles.label} />
            <TextInput
                style={styles.nameInput}
                value={listName}
                onChangeText={setListName}
                placeholder="e.g. Week 4 vocab"
                placeholderTextColor="#888"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
            />

            <InterText text="Paste words" style={styles.label} />
            <TextInput
                style={styles.pasteInput}
                value={pasted}
                onChangeText={setPasted}
                placeholder="Paste a list of words. Spaces, commas, or new lines all work."
                placeholderTextColor="#888"
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                textAlignVertical="top"
            />

            <View style={styles.previewCard}>
                <InterText
                    text={
                        parsedWords.length === 0
                            ? 'No words detected yet'
                            : `${parsedWords.length} word${parsedWords.length === 1 ? '' : 's'} detected`
                    }
                    style={styles.previewHeadline}
                />
                {parsedWords.length > 0 && (
                    <InterText
                        text={
                            parsedWords.slice(0, 30).join(', ') +
                            (parsedWords.length > 30 ? '…' : '')
                        }
                        style={styles.previewBody}
                    />
                )}
            </View>

            <Pressable
                onPress={handleSave}
                style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
            >
                <RecursiveText text="Save list" style={styles.saveButtonText} />
            </Pressable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    content: {
        paddingHorizontal: width * 0.06,
        paddingTop: height * 0.025,
        paddingBottom: height * 0.05,
    },
    label: {
        fontSize: scaleFont(14),
        color: '#b0b0b0',
        marginBottom: height * 0.008,
    },
    nameInput: {
        backgroundColor: '#333333',
        color: 'white',
        borderRadius: 10,
        padding: height * 0.018,
        fontSize: scaleFont(16),
        fontFamily: 'Inter-SemiBold',
        marginBottom: height * 0.022,
    },
    pasteInput: {
        backgroundColor: '#333333',
        color: 'white',
        borderRadius: 10,
        padding: height * 0.018,
        fontSize: scaleFont(15),
        fontFamily: 'Inter-SemiBold',
        minHeight: height * 0.22,
        marginBottom: height * 0.022,
    },
    previewCard: {
        backgroundColor: '#2c2c2c',
        borderRadius: 10,
        padding: height * 0.018,
        marginBottom: height * 0.025,
    },
    previewHeadline: {
        fontSize: scaleFont(15),
        color: '#ffc800',
        marginBottom: height * 0.008,
    },
    previewBody: {
        fontSize: scaleFont(14),
        color: '#b0b0b0',
        lineHeight: scaleFont(20),
    },
    saveButton: {
        backgroundColor: '#ce82ff',
        borderRadius: 12,
        height: height * 0.07,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonPressed: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: scaleFont(20),
    },
});

export default PasteListScreen;
