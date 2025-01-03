import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Main Home Screen
import HomeScreen from '../../screens/HomeScreen';

const HomeStack = createStackNavigator();

const HomeNavigation = () => {
	return (
		<HomeStack.Navigator>
			<HomeStack.Screen
				name="HomeMain"
				component={HomeScreen}
				options={{ headerTitle: 'Home', headerShown: false }}
			/>
		</HomeStack.Navigator>
	);
};

export default HomeNavigation;