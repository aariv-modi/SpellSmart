import { createAudioPlayer } from 'expo-audio';
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

const audioBaseUrl = Constants.expoConfig?.extra?.audioBaseUrl;
const ttsProxyUrl = Constants.expoConfig?.extra?.ttsProxyUrl;

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
    timeoutId = setTimeout(() => finish(() => reject(new Error('Audio timeout'))), 10000);
    player.play();
  });

const speakViaOS = (text) => {
  const plain = text.replace(/<\/?[^>]+>/g, '');
  return new Promise((resolve) => {
    Speech.speak(plain, {
      onDone: resolve,
      onStopped: resolve,
      onError: resolve,
    });
  });
};

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
