import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COLORS = {
    correct: '#58cc02',
    incorrect: '#ff4b4b',
};

const INNER_ICONS = {
    correct: 'checkmark',
    incorrect: 'close',
};

const ICON_SIZE = height * 0.18;

const INNER_SIZE_RATIO = {
    correct: 0.5,
    incorrect: 0.6,
};

const FeedbackOverlay = ({ type, tick, onDone }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        if (!type) return;

        opacity.setValue(0);
        scale.setValue(0.6);

        Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
                Animated.delay(280),
                Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
            ]),
        ]).start(({ finished }) => {
            if (finished) onDone?.();
        });
    }, [type, tick]);

    if (!type) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            <Animated.View style={[styles.iconStack, { opacity, transform: [{ scale }] }]}>
                <Ionicons name="ellipse" size={ICON_SIZE} color={COLORS[type]} />
                <Ionicons
                    name={INNER_ICONS[type]}
                    size={ICON_SIZE * INNER_SIZE_RATIO[type]}
                    color="white"
                    style={[styles.iconInner, type === 'correct' && styles.checkBold]}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    iconStack: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconInner: {
        position: 'absolute',
    },
    checkBold: {
        textShadowColor: 'white',
        textShadowOffset: { width: 3, height: 0 },
        textShadowRadius: 1,
    },
});

export default FeedbackOverlay;
