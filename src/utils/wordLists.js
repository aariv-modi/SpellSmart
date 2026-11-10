import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { registerBakedWords } from './speak';

import bundled3rd4th from '../../data/lists/thirdFourth.json';
import bundled5th6th from '../../data/lists/fifthSixth.json';
import bundled7th8th from '../../data/lists/seventhEighth.json';

const BUNDLED = {
    '3rd-4th': bundled3rd4th,
    '5th-6th': bundled5th6th,
    '7th-8th': bundled7th8th,
};

const REMOTE_KEYS = {
    '3rd-4th': 'thirdFourth',
    '5th-6th': 'fifthSixth',
    '7th-8th': 'seventhEighth',
};

const baseUrl = Constants.expoConfig?.extra?.listsBaseUrl;

const cacheKey = (name) => `wordList:${name}`;
const etagKey = (name) => `wordList:${name}:etag`;

const inFlight = new Map();

export async function getWordList(gradeLevel) {
    if (!BUNDLED[gradeLevel]) throw new Error(`Unknown list: ${gradeLevel}`);
    if (!inFlight.has(gradeLevel)) {
        inFlight.set(
            gradeLevel,
            resolve(gradeLevel).then((words) => {
                registerBakedWords(words);
                return words;
            }),
        );
    }
    return inFlight.get(gradeLevel);
}

async function resolve(gradeLevel) {
    const remoteName = REMOTE_KEYS[gradeLevel];

    if (baseUrl) {
        try {
            const cachedEtag = await AsyncStorage.getItem(etagKey(gradeLevel));
            const headers = cachedEtag ? { 'If-None-Match': cachedEtag } : {};
            const res = await fetch(`${baseUrl}/${remoteName}.json`, { headers });

            if (res.status === 200) {
                const words = await res.json();
                const etag = res.headers.get('ETag');
                await AsyncStorage.setItem(cacheKey(gradeLevel), JSON.stringify(words));
                if (etag) await AsyncStorage.setItem(etagKey(gradeLevel), etag);
                return words;
            }
            if (res.status === 304) {
                const cached = await AsyncStorage.getItem(cacheKey(gradeLevel));
                if (cached) return JSON.parse(cached);
            }
        } catch {
            // network or parse failure — fall through
        }
    }

    try {
        const cached = await AsyncStorage.getItem(cacheKey(gradeLevel));
        if (cached) return JSON.parse(cached);
    } catch {
        // ignore
    }

    return BUNDLED[gradeLevel];
}
