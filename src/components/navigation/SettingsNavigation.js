import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TopBar from '../TopBar';

import SettingsScreen from '../../screens/SettingsScreen';

const SettingsStack = createStackNavigator();

const SettingsNavigation = () => {
    return (
        <SettingsStack.Navigator
            screenOptions={{
                header: (props) => <TopBar {...props} />,
            }}
        >
            <SettingsStack.Screen
                name="SettingsMain"
                component={SettingsScreen}
                options={{ title: 'Settings', barColor: '#2b70c9' }}
            />
        </SettingsStack.Navigator>
    );
};

export default SettingsNavigation;
