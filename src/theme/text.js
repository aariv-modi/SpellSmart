import { scaleFont } from '../utils/responsiveTextSize';

// Typography sizes. All run through scaleFont so they adjust per device.
export const text = {
    display: scaleFont(32),
    titleLarge: scaleFont(24),
    title: scaleFont(20),
    body: scaleFont(16),
    bodySmall: scaleFont(14),
    caption: scaleFont(12),
};
