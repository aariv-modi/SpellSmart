import { isCorrectSpelling, primarySpelling, spellings } from '../wordVariants';

describe('spellings', () => {
    test('splits an entry into its accepted spellings', () => {
        expect(spellings('vapor, vapour')).toEqual(['vapor', 'vapour']);
    });

    test('returns a single spelling for a normal entry', () => {
        expect(spellings('rhythm')).toEqual(['rhythm']);
    });

    test('ignores empty parts and stray whitespace', () => {
        expect(spellings(' gauge ,  gage ,')).toEqual(['gauge', 'gage']);
    });
});

describe('primarySpelling', () => {
    test('is the first listed spelling', () => {
        expect(primarySpelling('barbecue, barbeque')).toBe('barbecue');
    });

    test('is the entry itself when there are no variants', () => {
        expect(primarySpelling('Nobel Prize')).toBe('Nobel Prize');
    });
});

describe('isCorrectSpelling', () => {
    test('accepts the exact spelling', () => {
        expect(isCorrectSpelling('rhythm', 'rhythm')).toBe(true);
    });

    test('rejects a misspelling', () => {
        expect(isCorrectSpelling('rythm', 'rhythm')).toBe(false);
    });

    test('accepts either spelling of a variant entry', () => {
        expect(isCorrectSpelling('vapor', 'vapor, vapour')).toBe(true);
        expect(isCorrectSpelling('vapour', 'vapor, vapour')).toBe(true);
    });

    test('rejects the whole variant entry typed literally', () => {
        expect(isCorrectSpelling('vapor, vapour', 'vapor, vapour')).toBe(false);
    });

    // UIL counts a capitalization mistake as a miss.
    test('requires matching capitalization', () => {
        expect(isCorrectSpelling('Germany', 'Germany')).toBe(true);
        expect(isCorrectSpelling('germany', 'Germany')).toBe(false);
        expect(isCorrectSpelling('Rhythm', 'rhythm')).toBe(false);
        expect(isCorrectSpelling('Band-aid', 'Band-Aid')).toBe(false);
    });

    test('requires matching capitalization for each variant', () => {
        expect(isCorrectSpelling('OK', 'OK, okay')).toBe(true);
        expect(isCorrectSpelling('okay', 'OK, okay')).toBe(true);
        expect(isCorrectSpelling('ok', 'OK, okay')).toBe(false);
        expect(isCorrectSpelling('OKAY', 'OK, okay')).toBe(false);
    });

    test('ignores leading and trailing spaces', () => {
        expect(isCorrectSpelling('  rhythm ', 'rhythm')).toBe(true);
    });

    test('accepts multi-word entries, even with doubled spaces', () => {
        expect(isCorrectSpelling('trial and error', 'trial and error')).toBe(true);
        expect(isCorrectSpelling('trial  and error', 'trial and error')).toBe(true);
        expect(isCorrectSpelling('trialand error', 'trial and error')).toBe(false);
    });

    test('requires hyphens', () => {
        expect(isCorrectSpelling('brother-in-law', 'brother-in-law')).toBe(true);
        expect(isCorrectSpelling('brother in law', 'brother-in-law')).toBe(false);
    });

    // iOS "Smart Punctuation" turns a typed ' into a curly ’ by default.
    test('accepts a curly apostrophe for a straight one', () => {
        expect(isCorrectSpelling('fool’s gold', "fool's gold")).toBe(true);
        expect(isCorrectSpelling('hors d’oeuvre', "hors d'oeuvre")).toBe(true);
    });

    test('requires the apostrophe itself', () => {
        expect(isCorrectSpelling('fools gold', "fool's gold")).toBe(false);
    });

    // An accented letter can be one character (é) or e + a combining accent,
    // depending on the keyboard. Both should count.
    test('treats composed and decomposed accents as the same letter', () => {
        const composed = 'éclair'.normalize('NFC');
        const decomposed = 'éclair'.normalize('NFD');
        expect(isCorrectSpelling(decomposed, composed)).toBe(true);
        expect(isCorrectSpelling(composed, decomposed)).toBe(true);
    });

    // UIL does not count a missing or wrong accent as a miss.
    test('ignores accents', () => {
        expect(isCorrectSpelling('eclair', 'éclair')).toBe(true);
        expect(isCorrectSpelling('éclair', 'éclair')).toBe(true);
        expect(isCorrectSpelling('èclair', 'éclair')).toBe(true);
        expect(isCorrectSpelling('Gruyere', 'Gruyère')).toBe(true);
    });

    test('still checks the letters and capitals around an accent', () => {
        expect(isCorrectSpelling('gruyere', 'Gruyère')).toBe(false);
        expect(isCorrectSpelling('eclare', 'éclair')).toBe(false);
    });
});
