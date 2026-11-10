import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultUserData } from '../defaultUserData';
import {
    addList,
    addListWithWords,
    addWord,
    bookmarkWord,
    checkNewUser,
    deleteList,
    deleteWord,
    getBookmarkedWords,
    getCustomListLengths,
    getCustomListNames,
    getList,
    uniqueListName,
    unbookmarkWord,
    updateListName,
} from '../HelperFunctions';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const seed = (overrides = {}) =>
    AsyncStorage.setItem('userData', JSON.stringify({ ...defaultUserData, ...overrides }));

const stored = async () => JSON.parse(await AsyncStorage.getItem('userData'));

beforeEach(async () => {
    await AsyncStorage.clear();
});

describe('custom lists', () => {
    test('a new list starts empty and is listed with its length', async () => {
        await seed();
        await addList('Week 1');

        expect(await getCustomListNames()).toEqual(['Week 1']);
        expect(await getCustomListLengths()).toEqual([0]);
    });

    test('adding a list with an existing name does nothing', async () => {
        await seed({ spellingLists: [{ name: 'Week 1', words: ['rhythm'] }] });
        await addList('Week 1');

        expect((await stored()).spellingLists).toEqual([{ name: 'Week 1', words: ['rhythm'] }]);
    });

    test('words are added once, in order', async () => {
        await seed();
        await addList('Week 1');
        await addWord('rhythm', 'Week 1');
        await addWord('chaos', 'Week 1');
        await addWord('rhythm', 'Week 1');

        expect(await getList('Week 1')).toEqual(['rhythm', 'chaos']);
    });

    test('deleting a word removes only that word from that list', async () => {
        await seed({
            spellingLists: [
                { name: 'A', words: ['rhythm', 'chaos'] },
                { name: 'B', words: ['rhythm'] },
            ],
        });
        await deleteWord('rhythm', 'A');

        expect(await getList('A')).toEqual(['chaos']);
        expect(await getList('B')).toEqual(['rhythm']);
    });

    test('renaming keeps the words and position', async () => {
        await seed({
            spellingLists: [
                { name: 'A', words: ['one'] },
                { name: 'B', words: ['two'] },
            ],
        });
        await updateListName('A', 'Renamed');

        expect(await getCustomListNames()).toEqual(['Renamed', 'B']);
        expect(await getList('Renamed')).toEqual(['one']);
    });

    test('deleting a list removes only that list', async () => {
        await seed({
            spellingLists: [
                { name: 'A', words: [] },
                { name: 'B', words: [] },
            ],
        });
        await deleteList('A');

        expect(await getCustomListNames()).toEqual(['B']);
    });

    test('other saved data is untouched by list edits', async () => {
        await seed({ bookmarkedWords: ['azure'], numSessions: 12 });
        await addList('Week 1');
        await addWord('rhythm', 'Week 1');
        await updateListName('Week 1', 'Week 2');
        await deleteList('Week 2');

        const data = await stored();
        expect(data.bookmarkedWords).toEqual(['azure']);
        expect(data.numSessions).toBe(12);
        expect(data.spellingLists).toEqual([]);
    });
});

describe('lists from pasted text or photos', () => {
    test('words are trimmed, de-duplicated and blanks dropped', async () => {
        await seed();
        await addListWithWords('Pasted', [' rhythm', 'chaos ', '', 'rhythm', '   ']);

        expect(await getList('Pasted')).toEqual(['rhythm', 'chaos']);
    });

    test('a taken name gets the next free number', async () => {
        await seed({
            spellingLists: [
                { name: 'Scan', words: [] },
                { name: 'Scan (2)', words: [] },
            ],
        });

        expect(await uniqueListName('Scan')).toBe('Scan (3)');
        expect(await uniqueListName('Other')).toBe('Other');
    });
});

describe('bookmarks', () => {
    test('bookmarking is idempotent and unbookmarking removes the word', async () => {
        await seed();
        await bookmarkWord('azure');
        await bookmarkWord('azure');
        await bookmarkWord('rhythm');
        expect(await getBookmarkedWords()).toEqual(['azure', 'rhythm']);

        await unbookmarkWord('azure');
        expect(await getBookmarkedWords()).toEqual(['rhythm']);
    });
});

describe('checkNewUser', () => {
    test('is true only when nothing has been saved yet', async () => {
        expect(await checkNewUser()).toBe(true);
        await seed();
        expect(await checkNewUser()).toBe(false);
    });
});
