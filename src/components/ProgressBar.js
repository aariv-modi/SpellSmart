import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const ProgressBar = ({ progress }) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));

    return (
        <View
            style={[
                styles.container,
                { height: height * 0.04, backgroundColor: '#333333', borderRadius: 25 },
            ]}
        >
            <View
                style={[
                    styles.progressFill,
                    {
                        width: `${clampedProgress * 100}%`,
                        backgroundColor: '#ff9600',
                        borderRadius: 25,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '68%',
        overflow: 'hidden',
    },
    progressFill: {
        height: height * 0.04,
    },
});

export default ProgressBar;
