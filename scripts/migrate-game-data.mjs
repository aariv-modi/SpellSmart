import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = resolve(ROOT, 'src/utils/gameData.js');
const OUT_DIR = resolve(ROOT, 'data/lists');

const source = readFileSync(SRC, 'utf8');

const extractArray = (varName) => {
  const re = new RegExp(`export const ${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const m = source.match(re);
  if (!m) throw new Error(`Could not find ${varName}`);
  const body = m[1].replace(/,(\s*)$/, '$1');
  return JSON.parse(`[${body}]`);
};

const lists = {
  thirdFourth: extractArray('thirdFourthList'),
  fifthSixth: extractArray('fifthSixthList'),
  seventhEighth: extractArray('seventhEighthList'),
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, words] of Object.entries(lists)) {
  const outPath = resolve(OUT_DIR, `${name}.json`);
  writeFileSync(outPath, JSON.stringify(words, null, 2) + '\n');
  console.log(`${name}: ${words.length} words -> ${outPath}`);
}
