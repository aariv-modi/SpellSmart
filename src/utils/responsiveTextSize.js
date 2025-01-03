import { Dimensions, PixelRatio, Platform } from 'react-native';

export function scaleFont(fontSize) {
    const { width, height } = Dimensions.get('window');

    const standardWidth = 393; // Define your standard screen width (iPhone 15 Pro width)
    const standardHeight = 852; // Define your standard screen height (iPhone 15 Pro height)

    const widthScale = width / standardWidth;
    const heightScale = height / standardHeight;
    const scale = Math.min(widthScale, heightScale);

    const adjustedFontSize = fontSize * scale;

    // If the device is Android, scale the font size by PixelRatio
    if (Platform.OS === 'android') {
        return PixelRatio.roundToNearestPixel(adjustedFontSize) - 2;
    }

    // If the device is iOS, return the adjusted font size
    return adjustedFontSize;
};