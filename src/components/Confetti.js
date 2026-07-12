import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 60;
const COLORS = ['#ff4b4b', '#ffc800', '#58cc02', '#1cb0f6', '#ce82ff', '#ff9600'];

const random = (min, max) => Math.random() * (max - min) + min;

const Particle = ({ index }) => {
    const fall = useRef(new Animated.Value(0)).current;
    const startX = useRef(random(0, width)).current;
    const xDrift = useRef(random(-120, 120)).current;
    const color = useRef(COLORS[Math.floor(Math.random() * COLORS.length)]).current;
    const size = useRef(random(6, 11)).current;
    const rotateEnd = useRef(`${random(360, 1080)}deg`).current;
    const duration = useRef(random(1800, 2800)).current;

    useEffect(() => {
        Animated.timing(fall, {
            toValue: 1,
            duration,
            delay: index * 25,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: size,
                height: size * 1.6,
                backgroundColor: color,
                left: startX,
                top: -20,
                opacity: fall.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [1, 1, 0],
                }),
                transform: [
                    {
                        translateY: fall.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, height + 80],
                        }),
                    },
                    {
                        translateX: fall.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, xDrift],
                        }),
                    },
                    {
                        rotate: fall.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', rotateEnd],
                        }),
                    },
                ],
            }}
        />
    );
};

const Confetti = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <Particle key={i} index={i} />
        ))}
    </View>
);

export default Confetti;
