import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const CORRECT_VOLUME = 0.25;
const INCORRECT_VOLUME = 1.0;

const correctPlayer = createAudioPlayer(require('../../assets/audio/correct.mp3'));
const incorrectPlayer = createAudioPlayer(require('../../assets/audio/incorrect.mp3'));

correctPlayer.volume = CORRECT_VOLUME;
incorrectPlayer.volume = INCORRECT_VOLUME;

const SAFETY_TIMEOUT_MS = 2000;

const play = (player) =>
    new Promise((resolve) => {
        let settled = false;
        let listener;

        const settle = () => {
            if (settled) return;
            settled = true;
            clearTimeout(safety);
            try { listener?.remove(); } catch {}
            resolve();
        };

        listener = player.addListener('playbackStatusUpdate', (status) => {
            if (status.didJustFinish) settle();
        });

        const safety = setTimeout(settle, SAFETY_TIMEOUT_MS);

        try {
            player.seekTo(0);
            player.play();
        } catch {
            settle();
        }
    });

export const feedbackCorrect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await play(correctPlayer);
};

export const feedbackIncorrect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await play(incorrectPlayer);
};
