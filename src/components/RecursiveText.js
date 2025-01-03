import React from "react"
import { Text } from "react-native"
import { useFonts } from 'expo-font';

const RecursiveText = function ({ text, style }) {
    useFonts({ 'Feather-Bold': require('../../assets/fonts/Feather-Bold.ttf') });
    return <Text allowFontScaling={false} style={[{ fontFamily: 'Feather-Bold', color: 'white' }, style]}>{text}</Text>
}

export default RecursiveText;