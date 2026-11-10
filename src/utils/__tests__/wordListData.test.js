import fifthSixth from '../../../data/lists/fifthSixth.json';
import seventhEighth from '../../../data/lists/seventhEighth.json';
import thirdFourth from '../../../data/lists/thirdFourth.json';
import { spellings } from '../wordVariants';

// The lists are extracted from UIL's PDFs each year; these checks catch extraction
// mistakes like page-footer text glued onto a word or a word split across lines.
const LISTS = { thirdFourth, fifthSixth, seventhEighth };

// Letters (including accented Latin letters), spaces, hyphens and apostrophes.
const VALID_SPELLING = /^[A-Za-zÀ-ɏ]+(?:[ '-][A-Za-zÀ-ɏ]+)*$/;

describe.each(Object.entries(LISTS))('%s', (name, list) => {
    test('is a non-empty list of strings', () => {
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);
        list.forEach((entry) => expect(typeof entry).toBe('string'));
    });

    test('every spelling uses only letters, spaces, hyphens and apostrophes', () => {
        const bad = list.flatMap(spellings).filter((s) => !VALID_SPELLING.test(s));
        expect(bad).toEqual([]);
    });

    test('variant entries are written as "first, second"', () => {
        const bad = list.filter(
            (entry) => entry.includes(',') && entry !== spellings(entry).join(', '),
        );
        expect(bad).toEqual([]);
    });

    test('text is stored in composed Unicode form', () => {
        expect(list.filter((entry) => entry !== entry.normalize('NFC'))).toEqual([]);
    });

    test('no spelling appears twice', () => {
        const seen = new Map();
        const dupes = [];
        for (const entry of list) {
            for (const s of spellings(entry)) {
                const key = s.toLowerCase();
                if (seen.has(key)) dupes.push(`${seen.get(key)} / ${entry}`);
                else seen.set(key, entry);
            }
        }
        expect(dupes).toEqual([]);
    });
});
