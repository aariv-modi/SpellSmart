import React from "react"
import { Text } from "react-native"
import { useFonts } from 'expo-font';

const InterText = function ({ text, style }) {
    useFonts({ 'Nunito-SemiBold': require('../../assets/fonts/Nunito-SemiBold.ttf') });
    return <Text allowFontScaling={false} style={[{ fontFamily: 'Nunito-SemiBold', color: 'white' }, style]}>{text}</Text>
}

export default InterText;