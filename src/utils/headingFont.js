// Headings use Feather Bold, a commercial font that can't be redistributed, so it
// isn't checked in. Put Feather-Bold.ttf in assets/fonts/ to use it; without it,
// headings fall back to Nunito.
let featherBold = null;
try {
    featherBold = require('../../assets/fonts/Feather-Bold.ttf');
} catch {
    // Font file not present.
}

export const HEADING_FONT = featherBold ? 'Feather-Bold' : 'Nunito-SemiBold';
export const HEADING_FONT_FILES = featherBold ? { 'Feather-Bold': featherBold } : {};
