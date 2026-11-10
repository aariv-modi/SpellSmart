// UIL lists some words with accepted alternate spellings, stored as a single
// entry like "vapor, vapour". Any listed spelling counts as correct; the first
// is the one we pronounce and spell out.

export const spellings = (entry) =>
    entry
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

export const primarySpelling = (entry) => spellings(entry)[0] ?? entry;

// Compare answers by letters, not by how the keyboard encoded them: iOS turns ' into ’
// ("Smart Punctuation"), and an accented letter can arrive as one character or two.
const normalizeAnswer = (text) =>
    text.normalize('NFC').replace(/[‘’ʼ]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

export const isCorrectSpelling = (input, entry) => {
    const answer = normalizeAnswer(input);
    return spellings(entry).some((s) => normalizeAnswer(s) === answer);
};
