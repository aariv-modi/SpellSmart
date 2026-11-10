// UIL lists some words with accepted alternate spellings, stored as a single
// entry like "vapor, vapour". Any listed spelling counts as correct; the first
// is the one we pronounce and spell out.

export const spellings = (entry) =>
    entry
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

export const primarySpelling = (entry) => spellings(entry)[0] ?? entry;

export const isCorrectSpelling = (input, entry) => {
    const answer = input.trim().toLowerCase();
    return spellings(entry).some((s) => s.toLowerCase() === answer);
};
