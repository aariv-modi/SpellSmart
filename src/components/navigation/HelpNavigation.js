import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TopBar from '../TopBar';

// Main Help Screen
import HelpScreen from '../../screens/HelpScreen';

const HelpStack = createStackNavigator();

const HelpNavigation = () => {
	return (
		<HelpStack.Navigator
			screenOptions={{
				header: (props) => <TopBar {...props} />,
			}}
		>
			<HelpStack.Screen
				name="HelpMain"
				component={HelpScreen}
				options={{ title: 'Help', barColor: '#2b70c9' }}
			/>
		</HelpStack.Navigator>
	);
};

export default HelpNavigation;