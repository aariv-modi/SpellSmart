import AsyncStorage from "@react-native-async-storage/async-storage";
import AWS from 'aws-sdk';
import { Audio } from 'expo-av';

AWS.config.update({
    accessKeyId: '***REMOVED***',
    secretAccessKey: '***REMOVED***',
    region: 'us-east-1'
})

export const getBookmarkedWords = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    return data["bookmarkedWords"];
}

export const getCustomLists = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    return data.spellingLists.map(list => list.words);
}

export const getMissedWords = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    return data["missedWords"];
}

export const getCustomListNames = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    return data.spellingLists.map(list => list.name);
}

export const getCustomListLengths = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    return data.spellingLists.map(list => list.words.length);
}

export const getList = async (listName) => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    return data.spellingLists.find(list => list.name === listName).words;
}

export const getLists = async () => {
    const allKeys = await AsyncStorage.getAllKeys()
    let allValues = await AsyncStorage.multiGet(allKeys)
    allValues = allValues.map(([, value]) => value)

    for (i = 0; i < allKeys.length; i++) {
        if (allKeys[i] == "bookmarked-words" || allKeys[i] == "current-words") {
            allKeys.splice(i, 1)
            allValues.splice(i, 1)
        }
    }
    return [allKeys, allValues]
}

export const bookmarkWord = async (word) => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    if (data.bookmarkedWords.includes(word)) return;
    const updatedData = { ...data, bookmarkedWords: [...data.bookmarkedWords, word] }
    await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
}

export const unbookmarkWord = async (word) => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    const updatedData = { ...data, bookmarkedWords: data.bookmarkedWords.filter(bookmarkedWord => bookmarkedWord !== word) };
    await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
}

export const updateListName = async (oldName, newName) => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));

    const updatedLists = data.spellingLists.map(list =>
        list.name === oldName ? { ...list, name: newName } : list
    );

    await AsyncStorage.setItem('userData', JSON.stringify({
        ...data,
        spellingLists: updatedLists
    }));
};

export const deleteList = async (listName) => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    data.spellingLists = data.spellingLists.filter(list => list.name !== listName);
    await AsyncStorage.setItem('userData', JSON.stringify(data));
};

export const deleteWord = async (word, listName) => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    const listIndex = data.spellingLists.findIndex(list => list.name === listName);

    data.spellingLists[listIndex].words = userData.spellingLists[listIndex].words.filter(word => word !== wordToRemove);
    await AsyncStorage.setItem('userData', JSON.stringify(data));
};

export const addWord = async (word, listName) => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    const listIndex = data.spellingLists.findIndex(list => list.name === listName);

    if (!data.spellingLists[listIndex].words.includes(word)) {
        data.spellingLists[listIndex].words.push(word);
        await AsyncStorage.setItem('userData', JSON.stringify(data));
    }
};

export const addList = async (listName) => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    const existingList = data.spellingLists.find(list => list.name === listName);
    if (!existingList) {
        data.spellingLists.push({
            name: listName,
            words: []
        });

        await AsyncStorage.setItem('userData', JSON.stringify(data));
    }
};

export const checkNewUser = async () => {
    const keys = await AsyncStorage.getAllKeys()
    if (keys.length == 0) {
        return true
    }
    return false
};

export const checkNewSolo = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    return data["newSoloMode"]
};

export const checkNewBuddy = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    return data["newBuddyMode"]
};

export const speak = async (text, engine = 'generative') => {
    const polly = new AWS.Polly();
    const textType = text.includes('<speak>') ? 'ssml' : 'text';

    try {
        const params = {
            Text: text,
            OutputFormat: 'mp3',
            VoiceId: 'Matthew',
            Engine: engine,
            TextType: textType
        };

        const data = await new Promise((resolve, reject) => {
            polly.synthesizeSpeech(params, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });

        const audioBase64 = data.AudioStream.toString('base64');
        const audioUri = `data:audio/mp3;base64,${audioBase64}`;
        const { sound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: true }
        );

        await sound.playAsync();

        return new Promise((resolve) => {
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    await sound.unloadAsync();
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('Error playing audio:', error);
        throw error;
    }
}; 