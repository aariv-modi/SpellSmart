import AsyncStorage from "@react-native-async-storage/async-storage";

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

    data.spellingLists[listIndex].words = data.spellingLists[listIndex].words.filter(w => w !== word);
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

export const uniqueListName = async (desiredName) => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    const existing = new Set(data.spellingLists.map(l => l.name));
    if (!existing.has(desiredName)) return desiredName;
    let i = 2;
    while (existing.has(`${desiredName} (${i})`)) i++;
    return `${desiredName} (${i})`;
};

export const addListWithWords = async (listName, words) => {
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    const dedupedWords = [...new Set(words.map(w => w.trim()).filter(Boolean))];
    data.spellingLists.push({ name: listName, words: dedupedWords });
    await AsyncStorage.setItem('userData', JSON.stringify(data));
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
