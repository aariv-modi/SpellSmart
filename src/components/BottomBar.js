import React from "react";
import { Dimensions, TouchableOpacity, SafeAreaView, Image, View } from "react-native"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeNavigation from "./navigation/HomeNavigation";
import ListsNavigation from "./navigation/ListsNavigation";
import SettingsNavigation from "./navigation/SettingsNavigation";

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');
const home = require('../../assets/images/target.png')
const lists = require('../../assets/images/clipboard.png')
const settings = require('../../assets/images/erm.png')
// Capped by height so the highlight fits the bar on wide screens (web); phones use the width value.
const ICON_BOX_SIZE = Math.min(width * 0.13, height * 0.09);

const TAB_ICONS = {
    HomeTab: {
        source: home,
        aspectRatio: 462 / 476
    },
    ListsTab: {
        source: lists,
        aspectRatio: 361 / 463
    },
    SettingsTab: {
        source: settings,
        aspectRatio: 376 / 462
    }
};

const BottomBar = ({ state, navigation }) => {
    const currentScreen = state?.routes[state.index]?.state?.routes.slice(-1)[0]?.name;
    const hideOnScreens = ['Solo', 'Buddy', 'MissedWords', 'EndSession'];

    if (hideOnScreens.includes(currentScreen)) {
        return null;
    }
    return (
        <SafeAreaView
            style={{
                flexDirection: 'row',
                backgroundColor: '#333333',
                height: height * 0.12,
                width: width,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 5,
            }}
        >
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const { source, aspectRatio } = TAB_ICONS[route.name];

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        onPress={onPress}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <View style={[
                            {
                                width: ICON_BOX_SIZE,
                                height: ICON_BOX_SIZE,
                                alignItems: 'center',
                                justifyContent: 'center'
                            },
                            isFocused && {
                                borderWidth: 2,
                                borderColor: '#1cb0f6',
                                borderRadius: 8,
                                backgroundColor: 'rgba(57, 193, 240, 0.1)' // Light blue tint at 10% opacity
                            }
                        ]}>
                            <Image
                                source={source}
                                style={{
                                    aspectRatio: aspectRatio,
                                    height: height * 0.05,
                                    width: height * 0.05 * aspectRatio
                                }}
                            />
                        </View>
                    </TouchableOpacity>
                );
            })}
        </SafeAreaView>
    );
};

const BottomNavigation = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <BottomBar {...props} />}
            screenOptions={() => ({
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeNavigation}
            />
            <Tab.Screen
                name="ListsTab"
                component={ListsNavigation}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsNavigation}
            />
        </Tab.Navigator>
    );
};

export default BottomNavigation;
