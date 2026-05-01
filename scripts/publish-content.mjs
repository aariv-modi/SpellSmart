import 'dotenv/config';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const ROOT = resolve(import.meta.dirname, '..');
const LISTS_DIR = resolve(ROOT, 'data/lists');
const AUDIO_DIR = resolve(ROOT, 'audio-output');

const BUCKET = process.env.R2_BUCKET ?? 'spellsmart-audio';
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const CONCURRENCY = Number(process.env.R2_CONCURRENCY ?? 10);

const required = { ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY };
for (const [name, value] of Object.entries(required)) {
  if (!value) throw new Error(`Missing env var: R2_${name}`);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
});

const listAllKeys = async (prefix) => {
  const keys = new Set();
  let token;
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET, Prefix: prefix, ContinuationToken: token,
    }));
    for (const obj of res.Contents ?? []) keys.add(obj.Key);
    token = res.NextContinuationToken;
  } while (token);
  return keys;
};

const upload = async (key, body, contentType) => {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: body, ContentType: contentType,
  }));
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
        process.stdout.write(`\n  ERROR: ${err.message}\n`);
      }
      tick();
    }
  });
  await Promise.all(runners);
  if (total) process.stdout.write('\n');
};

const publishLists = async () => {
  console.log('Publishing word lists...');
  const files = readdirSync(LISTS_DIR).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const body = readFileSync(resolve(LISTS_DIR, file));
    const key = `lists/${file}`;
    await upload(key, body, 'application/json');
    console.log(`  ${key} (${body.length} bytes)`);
  }
};

const publishAudio = async () => {
  console.log('Diffing audio against R2...');
  const existing = await listAllKeys('audio/');
  const local = readdirSync(AUDIO_DIR).filter((f) => f.endsWith('.mp3'));
  const toUpload = local.filter((f) => !existing.has(`audio/${f}`));

  console.log(`  Local: ${local.length}, in R2: ${existing.size}, to upload: ${toUpload.length}`);
  if (toUpload.length === 0) return;

  console.log(`Uploading audio (concurrency ${CONCURRENCY})...`);
  await runWithConcurrency(toUpload, CONCURRENCY, async (file) => {
    const body = readFileSync(resolve(AUDIO_DIR, file));
    await upload(`audio/${file}`, body, 'audio/mpeg');
  });
};

const main = async () => {
  await publishLists();
  await publishAudio();
  console.log('Done.');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
