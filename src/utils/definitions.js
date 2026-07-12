import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const CACHE_PREFIX = 'def:v1:';
const FETCH_TIMEOUT_MS = 6000;

const asUrl = (v) => (typeof v === 'string' && v.length > 0 ? v : null);
const proxyUrl = asUrl(Constants.expoConfig?.extra?.ttsProxyUrl);

const inFlight = new Map();

const cacheKey = (word) => `${CACHE_PREFIX}${word.toLowerCase()}`;

export const getDefinition = async (word) => {
    if (typeof word !== 'string' || word.length === 0) return null;
    const key = cacheKey(word);

    const cached = await AsyncStorage.getItem(key);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch {
            // Fall through to refetch on parse error
        }
    }

    if (!proxyUrl) return null;

    if (inFlight.has(key)) return inFlight.get(key);

    const promise = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const res = await fetch(`${proxyUrl}/define?word=${encodeURIComponent(word)}`, {
                signal: controller.signal,
            });
            const payload = await res.json();
            await AsyncStorage.setItem(key, JSON.stringify(payload));
            return payload;
        } catch {
            return null;
        } finally {
            clearTimeout(timer);
            inFlight.delete(key);
        }
    })();

    inFlight.set(key, promise);
    return promise;
};
