import React from "react";
import { StyleSheet, Dimensions, Pressable, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import InterText from "./InterText";

import { scaleFont } from "../utils/responsiveTextSize";

const { width, height } = Dimensions.get('window');

const BuddyCard = function ({ text, ionicon, color, onTouch, style = {} }) {
    return (
        <Pressable onPress={() => onTouch()} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]}>
            <View style={[styles.card, { backgroundColor: color }, style]}>
                    <Ionicons name={ionicon} size={height * 0.105} color="white" style={{ marginTop: height * 0.02 }}/>
                    <InterText text={text} style={{ fontSize: scaleFont(16), marginBottom: height * 0.02 }} />
            </View>
        </Pressable>
    )
};

const styles = StyleSheet.create({
    card: {
        height: height * 0.185,
        width: height * 0.185,
        boxShadow: '0px 2px 10px rgba(3,3,3,0.2)',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
    }
})

export default BuddyCard;