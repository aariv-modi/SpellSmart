import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ModeCard from '../components/ModeCard';
import { checkNewSolo, checkNewBuddy } from '../utils/HelperFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const MODE_CONFIGS = {
    Solo: {
        title: 'SOLO MODE',
        icon: 'person',
        description: 'Play by yourself!',
        checkNewStatus: checkNewSolo,
    },
    Buddy: {
        title: 'BUDDY MODE',
        icon: 'people',
        description: 'Ask a friend to help you out!',
        checkNewStatus: checkNewBuddy,
    },
};

const ModeSelectionScreen = ({ navigation, route }) => {
    const handleModeSelection = useCallback(
        async (mode) => {
            const isNewToMode = await MODE_CONFIGS[mode].checkNewStatus();
            const targetScreen = isNewToMode ? `${mode}Tutorial` : mode;
            if (isNewToMode) {
                const userData = JSON.parse(await AsyncStorage.getItem('userData'));
                await AsyncStorage.setItem(
                    'userData',
                    JSON.stringify({
                        ...userData,
                        [`new${mode}Mode`]: false,
                    }),
                );
            }
            navigation.navigate(targetScreen, route.params);
        },
        [navigation, route.params],
    );

    const modeCards = useMemo(
        () =>
            Object.entries(MODE_CONFIGS).map(([mode, config]) => (
                <ModeCard
                    key={mode}
                    title={config.title}
                    ionicon={config.icon}
                    description={config.description}
                    onTouch={() => handleModeSelection(mode)}
                />
            )),
        [handleModeSelection],
    );

    return (
        <View style={styles.container}>
            <View style={styles.modeCardContainer}>{modeCards}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: height * 0.7,
        width: width,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modeCardContainer: {
        height: height * 0.66,
        justifyContent: 'space-between',
    },
});

export default ModeSelectionScreen;
