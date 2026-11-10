import React, { useState } from 'react';
import { View, StatusBar, Dimensions, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RecursiveText from './RecursiveText';
import { scaleFont } from '../utils/responsiveTextSize';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const TopBar = ({ options }) => {
    const navigation = useNavigation();
    const currentScreenName = useRoute().name;
    const screensWithoutBackButton = ['HomeMain', 'ListsMain', 'SettingsMain', 'Solo', 'Buddy'];
    const [backOpacity, setBackOpacity] = useState(1);

    return (
        <View
            style={{
                flexDirection: 'row',
                backgroundColor: options.barColor ? options.barColor : '#58cc02',
                height: height * 0.18,
                width: width,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 5,
                paddingTop: StatusBar.currentHeight || 0,
            }}
        >
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: height * 0.1,
                }}
            >
                {!screensWithoutBackButton.includes(currentScreenName) ? (
                    <Pressable
                        onPressIn={() => setBackOpacity(0.5)}
                        onPressOut={() => setBackOpacity(1)}
                        onPress={() => navigation.goBack()}
                        style={{
                            position: 'absolute',
                            left: height * 0.01,
                            padding: 8,
                            backgroundColor: 'transparent',
                        }}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={height * 0.05}
                            color="white"
                            style={{ opacity: backOpacity }}
                        />
                    </Pressable>
                ) : null}

                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                    }}
                >
                    <RecursiveText
                        text={options.title}
                        style={{
                            fontSize: scaleFont(36),
                            color: 'white',
                        }}
                    />
                </View>
            </View>
        </View>
    );
};

export default TopBar;
