// UIL lists some words with accepted alternate spellings, stored as a single
// entry like "vapor, vapour". Any listed spelling counts as correct; the first
// is the one we pronounce and spell out.

export const spellings = (entry) =>
    entry
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

export const primarySpelling = (entry) => spellings(entry)[0] ?? entry;

// UIL scoring: capitalization counts, accents don't. Accents are removed by splitting each
// accented letter into letter + mark (NFD) and dropping the marks. iOS also turns ' into ’
// ("Smart Punctuation"), so both apostrophes count.
const normalizeAnswer = (text) =>
    text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\u2018\u2019\u02bc]/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

export const isCorrectSpelling = (input, entry) => {
    const answer = normalizeAnswer(input);
    return spellings(entry).some((s) => normalizeAnswer(s) === answer);
};
