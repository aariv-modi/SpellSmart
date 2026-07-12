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

// Worker cold starts can take several seconds; only kill the request if we
// haven't started receiving audio. Once playback begins, we trust it to finish.
const LOAD_TIMEOUT_MS = 8000;
const PLAY_BUFFER_MS = 5000;
const OS_SPEECH_SAFETY_MS = 15000;
// Grace window after a cancellation: expo-audio needs a moment to release the
// prior player's hold on the audio session, otherwise the next createAudioPlayer
// hangs without firing playback events.
const POST_STOP_GRACE_MS = 150;

let activePlayer = null;
let activeAbort = null;
let callToken = 0;
let lastStopAt = 0;

const playRemote = (uri) =>
  new Promise((resolve, reject) => {
    let player;
    try {
      player = createAudioPlayer({ uri });
    } catch (e) {
      return reject(e);
    }

    if (activePlayer && activePlayer !== player) {
      try { activePlayer.remove(); } catch {}
    }
    activePlayer = player;

    let started = false;
    let settled = false;
    let loadTimer;
    let playTimer;

    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(loadTimer);
      clearTimeout(playTimer);
      if (activePlayer === player) activePlayer = null;
      if (activeAbort === abort) activeAbort = null;
      try { player.remove(); } catch {}
      fn(value);
    };

    const abort = () => settle(reject, new Error('Aborted'));
    activeAbort = abort;

    player.addListener('playbackStatusUpdate', (status) => {
      if (settled) return;
      if (!started && (status.playing || status.isLoaded)) {
        started = true;
        clearTimeout(loadTimer);
        const ms = (status.duration > 0 ? status.duration * 1000 : 30000) + PLAY_BUFFER_MS;
        playTimer = setTimeout(() => settle(reject, new Error('Play timeout')), ms);
      }
      if (status.didJustFinish) settle(resolve);
    });

    loadTimer = setTimeout(() => {
      if (!started) settle(reject, new Error('Load timeout'));
    }, LOAD_TIMEOUT_MS);

    try {
      player.play();
    } catch (e) {
      settle(reject, e);
    }
  });

const speakViaOS = (text) =>
  new Promise((resolve) => {
    const plain = text.replace(/<\/?[^>]+>/g, '');
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      clearTimeout(safety);
      resolve();
    };
    const safety = setTimeout(settle, OS_SPEECH_SAFETY_MS);
    Speech.speak(plain, { onDone: settle, onStopped: settle, onError: settle });
  });

export const stopSpeak = () => {
  callToken++;
  if (activeAbort) {
    activeAbort();
    activeAbort = null;
  }
  if (activePlayer) {
    try { activePlayer.remove(); } catch {}
    activePlayer = null;
  }
  try { Speech.stop(); } catch {}
  lastStopAt = Date.now();
};

export const speak = async (text) => {
  if (typeof text !== 'string' || text.length === 0) return;

  stopSpeak();
  const myToken = callToken;
  const stillMine = () => myToken === callToken;

  const sinceStop = Date.now() - lastStopAt;
  if (sinceStop < POST_STOP_GRACE_MS) {
    await new Promise((r) => setTimeout(r, POST_STOP_GRACE_MS - sinceStop));
    if (!stillMine()) return;
  }

  if (audioBaseUrl && BAKED_WORDS.has(text)) {
    try {
      await playRemote(`${audioBaseUrl}/${encodeURIComponent(text)}.mp3`);
      return;
    } catch {
      // R2 fetch or playback failed — fall through
    }
  }
  if (!stillMine()) return;

  if (ttsProxyUrl) {
    try {
      await playRemote(`${ttsProxyUrl}?text=${encodeURIComponent(text)}`);
      return;
    } catch {
      // worker unreachable — fall through
    }
  }
  if (!stillMine()) return;

  await speakViaOS(text);
};
