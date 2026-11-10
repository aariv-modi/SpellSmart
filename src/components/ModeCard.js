import React from 'react';
import { StyleSheet, Dimensions, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RecursiveText from './RecursiveText';
import InterText from './InterText';
import { scaleFont } from './../utils/responsiveTextSize';

const { height } = Dimensions.get('window');

const ModeCard = ({ title, ionicon, description, onTouch }) => (
    <Pressable onPress={onTouch} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]}>
        <View style={styles.card}>
            <Ionicons name={ionicon} size={height * 0.12} color={'#ffc800'} />
            <RecursiveText text={title} style={styles.title} />
            <InterText text={description} style={styles.description} />
        </View>
    </Pressable>
);

const styles = StyleSheet.create({
    card: {
        height: height * 0.32,
        width: height * 0.42,
        backgroundColor: '#333333',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    title: {
        fontSize: scaleFont(28),
        marginTop: height * 0.02,
    },
    description: {
        fontSize: scaleFont(16),
        textAlign: 'center',
        marginTop: height * 0.02,
        width: height * 0.392,
    },
});

export default ModeCard;
