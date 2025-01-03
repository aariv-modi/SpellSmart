import React from "react";
import { Dimensions, TouchableOpacity, SafeAreaView, Image, View } from "react-native"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import PracticeNavigation from "./navigation/PracticeNavigation";
import ListsNavigation from "./navigation/ListsNavigation";
import BookmarksNavigation from "./navigation/BookmarksNavigation";
import HelpNavigation from "./navigation/HelpNavigation";

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');
const practice = require('../../assets/images/target.png')
const lists = require('../../assets/images/clipboard.png')
const bookmarks = require('../../assets/images/star.png')
const help = require('../../assets/images/erm.png')

const TAB_ICONS = {
    PracticeTab: {
        source: practice,
        aspectRatio: 462 / 476
    },
    ListsTab: {
        source: lists,
        aspectRatio: 361 / 463
    },
    BookmarksTab: {
        source: bookmarks,
        aspectRatio: 454 / 457
    },
    HelpTab: {
        source: help,
        aspectRatio: 376 / 462
    }
};

const BottomBar = ({ state, navigation }) => {
    const currentScreen = state?.routes[state.index]?.state?.routes.slice(-1)[0]?.name;
    const hideOnScreens = ['Solo', 'Buddy', 'MissedWords'];

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
                                width: width * 0.13,
                                height: width * 0.13,
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
                                    height: height * 0.05
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
                name="PracticeTab"
                component={PracticeNavigation}
            />
            <Tab.Screen
                name="ListsTab"
                component={ListsNavigation}
            />
            <Tab.Screen
                name="BookmarksTab"
                component={BookmarksNavigation}
            />
            <Tab.Screen
                name="HelpTab"
                component={HelpNavigation}
            />
        </Tab.Navigator>
    );
};

export default BottomNavigation;