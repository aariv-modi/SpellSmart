import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';

import bundled3rd4th from '../../data/lists/thirdFourth.json';
import bundled5th6th from '../../data/lists/fifthSixth.json';
import bundled7th8th from '../../data/lists/seventhEighth.json';

const BAKED_WORDS = new Set([
  ...bundled3rd4th,
  ...bundled5th6th,
  ...bundled7th8th,
]);

const asUrl = (v) => (typeof v === 'string' && v.length > 0 ? v : null);
const audioBaseUrl = asUrl(Constants.expoConfig?.extra?.audioBaseUrl);
const ttsProxyUrl = asUrl(Constants.expoConfig?.extra?.ttsProxyUrl);

// Mix mode lets expo-audio playback and expo-speech TTS share the iOS audio
// session without serializing through it (which adds multi-second delays).
setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});

const playRemote = (uri) =>
  new Promise((resolve, reject) => {
    const player = createAudioPlayer({ uri });
    let timeoutId;
    const finish = (fn) => {
      clearTimeout(timeoutId);
      player.remove();
      fn();
    };
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) finish(resolve);
    });
    timeoutId = setTimeout(() => finish(() => reject(new Error('Audio timeout'))), 5000);
    player.play();
  });

const speakViaOS = (text) =>
  new Promise((resolve) => {
    const plain = text.replace(/<\/?[^>]+>/g, '');
    Speech.speak(plain, { onDone: resolve, onStopped: resolve, onError: resolve });
  });

export const speak = async (text) => {
  if (audioBaseUrl && BAKED_WORDS.has(text)) {
    try {
      await playRemote(`${audioBaseUrl}/${encodeURIComponent(text)}.mp3`);
      return;
    } catch {
      // R2 fetch or playback failed — fall through
    }
  }

  if (ttsProxyUrl) {
    try {
      await playRemote(`${ttsProxyUrl}?text=${encodeURIComponent(text)}`);
      return;
    } catch {
      // worker unreachable — fall through
    }
  }

  await speakViaOS(text);
};
