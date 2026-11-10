import AsyncStorage from '@react-native-async-storage/async-storage';

import bundledThirdFourth from '../../../data/lists/thirdFourth.json';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-constants', () => ({
    expoConfig: { extra: { listsBaseUrl: 'https://lists.example' } },
}));
jest.mock('../speak', () => ({ registerBakedWords: jest.fn() }));

const REMOTE = ['remote', 'words'];

const response = (status, body, etag) => ({
    status,
    json: async () => body,
    headers: { get: (name) => (name === 'ETag' ? etag : null) },
});

// wordLists remembers in-flight requests per grade, so each test loads a fresh copy.
const load = () => {
    let mod;
    jest.isolateModules(() => {
        mod = { ...require('../wordLists'), speak: require('../speak') };
    });
    return mod;
};

beforeEach(async () => {
    await AsyncStorage.clear();
    global.fetch = jest.fn();
});

test('downloads the list and caches it with its ETag', async () => {
    fetch.mockResolvedValue(response(200, REMOTE, '"v2"'));

    const words = await load().getWordList('3rd-4th');

    expect(words).toEqual(REMOTE);
    expect(fetch).toHaveBeenCalledWith('https://lists.example/thirdFourth.json', { headers: {} });
    expect(JSON.parse(await AsyncStorage.getItem('wordList:3rd-4th'))).toEqual(REMOTE);
    expect(await AsyncStorage.getItem('wordList:3rd-4th:etag')).toBe('"v2"');
});

test('sends the cached ETag and uses the cached list when unchanged', async () => {
    await AsyncStorage.setItem('wordList:3rd-4th', JSON.stringify(REMOTE));
    await AsyncStorage.setItem('wordList:3rd-4th:etag', '"v2"');
    fetch.mockResolvedValue(response(304));

    const words = await load().getWordList('3rd-4th');

    expect(fetch).toHaveBeenCalledWith('https://lists.example/thirdFourth.json', {
        headers: { 'If-None-Match': '"v2"' },
    });
    expect(words).toEqual(REMOTE);
});

test('falls back to the cached list when offline', async () => {
    await AsyncStorage.setItem('wordList:5th-6th', JSON.stringify(REMOTE));
    fetch.mockRejectedValue(new TypeError('Network request failed'));

    expect(await load().getWordList('5th-6th')).toEqual(REMOTE);
});

test('falls back to the cached list on a server error', async () => {
    await AsyncStorage.setItem('wordList:5th-6th', JSON.stringify(REMOTE));
    fetch.mockResolvedValue(response(500));

    expect(await load().getWordList('5th-6th')).toEqual(REMOTE);
});

test('falls back to the bundled list when offline on first launch', async () => {
    fetch.mockRejectedValue(new TypeError('Network request failed'));

    expect(await load().getWordList('3rd-4th')).toEqual(bundledThirdFourth);
});

test('shares one download between simultaneous requests', async () => {
    fetch.mockResolvedValue(response(200, REMOTE, '"v2"'));
    const { getWordList } = load();

    const [a, b] = await Promise.all([getWordList('7th-8th'), getWordList('7th-8th')]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
});

test('registers downloaded words for pre-recorded audio', async () => {
    fetch.mockResolvedValue(response(200, REMOTE, '"v2"'));
    const { getWordList, speak } = load();

    await getWordList('3rd-4th');

    expect(speak.registerBakedWords).toHaveBeenCalledWith(REMOTE);
});

test('rejects an unknown grade', async () => {
    await expect(load().getWordList('9th-10th')).rejects.toThrow('Unknown list: 9th-10th');
});
