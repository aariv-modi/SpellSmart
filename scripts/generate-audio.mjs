import 'dotenv/config';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const ROOT = resolve(import.meta.dirname, '..');
const LISTS_DIR = resolve(ROOT, 'data/lists');
const OUTPUT_DIR = resolve(ROOT, 'audio-output');

const VOICE_NAME = process.env.TTS_VOICE_NAME ?? 'en-US-Neural2-D';
const LANGUAGE_CODE = process.env.TTS_LANGUAGE_CODE ?? 'en-US';
const CONCURRENCY = Number(process.env.TTS_CONCURRENCY ?? 10);

const collectUniqueWords = () => {
    const words = new Set();
    for (const file of readdirSync(LISTS_DIR)) {
        if (!file.endsWith('.json')) continue;
        const list = JSON.parse(readFileSync(resolve(LISTS_DIR, file), 'utf8'));
        // Entries like "vapor, vapour" list alternate spellings; the app speaks
        // only the first. Keep the full-entry audio too for older app builds.
        for (const word of list) {
            words.add(word);
            words.add(word.split(',')[0].trim());
        }
    }
    return [...words].sort();
};

const audioPath = (word) => resolve(OUTPUT_DIR, `${word}.mp3`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isRateLimit = (err) =>
    err?.code === 8 || /RESOURCE_EXHAUSTED|429|quota/i.test(err?.message ?? '');

const synthesize = async (client, word, attempt = 0) => {
    try {
        const [response] = await client.synthesizeSpeech({
            input: { text: word },
            voice: { languageCode: LANGUAGE_CODE, name: VOICE_NAME },
            audioConfig: { audioEncoding: 'MP3' },
        });
        writeFileSync(audioPath(word), response.audioContent);
    } catch (err) {
        if (isRateLimit(err) && attempt < 8) {
            const delay = Math.min(60000, 2000 * 2 ** attempt) + Math.random() * 1000;
            await sleep(delay);
            return synthesize(client, word, attempt + 1);
        }
        throw err;
    }
};

const runWithConcurrency = async (items, limit, worker) => {
    let i = 0;
    let done = 0;
    const total = items.length;
    const tick = () => process.stdout.write(`\r  ${++done}/${total}`);
    const runners = Array.from({ length: limit }, async () => {
        while (i < items.length) {
            const idx = i++;
            try {
                await worker(items[idx]);
            } catch (err) {
                process.stdout.write(`\n  ERROR on "${items[idx]}": ${err.message}\n`);
            }
            tick();
        }
    });
    await Promise.all(runners);
    process.stdout.write('\n');
};

const main = async () => {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error(
            'GOOGLE_APPLICATION_CREDENTIALS env var must be set (path to GCP service account JSON)',
        );
    }

    mkdirSync(OUTPUT_DIR, { recursive: true });

    const allWords = collectUniqueWords();
    const missing = allWords.filter((w) => !existsSync(audioPath(w)));

    console.log(`Total unique words: ${allWords.length}`);
    console.log(`Already generated: ${allWords.length - missing.length}`);
    console.log(`To generate: ${missing.length}`);

    if (missing.length === 0) {
        console.log('Nothing to do.');
        return;
    }

    console.log(`Voice: ${VOICE_NAME} (${LANGUAGE_CODE}), concurrency: ${CONCURRENCY}`);
    console.log('Generating...');

    const client = new TextToSpeechClient();
    await runWithConcurrency(missing, CONCURRENCY, (word) => synthesize(client, word));

    console.log(`Done. Files in: ${OUTPUT_DIR}`);
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
