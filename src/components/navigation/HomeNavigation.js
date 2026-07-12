import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ListTypeScreen from '../../screens/ListTypeScreen';
import ListSelectionScreen from '../../screens/ListSelectionScreen';
import ModeSelectionScreen from '../../screens/ModeSelectionScreen';
import SoloScreen from '../../screens/SoloScreen';
import SoloTutorialScreen from '../../screens/SoloTutorial';
import BuddyScreen from '../../screens/BuddyScreen';
import BuddyTutorialScreen from '../../screens/BuddyTutorial';
import MissedWordsScreen from '../../screens/MissedWordsScreen';
import EndSessionScreen from '../../screens/EndSessionScreen';
import TopBar from '../TopBar';

const HomeStack = createStackNavigator();

const HomeNavigation = () => {
	return (
		<HomeStack.Navigator
			screenOptions={{
				header: (props) => <TopBar {...props} />,
			}}
		>
			<HomeStack.Screen
				name="HomeMain"
				component={ListTypeScreen}
				options={{ title: 'Practice' }}
			/>
			<HomeStack.Screen
				name="ListSelection"
				component={ListSelectionScreen}
				options={({ route }) => ({
					title: route.params?.gradeLevel ? `UIL ${route.params?.gradeLevel}` : 'Custom Lists',
				})}
			/>
			<HomeStack.Screen
				name="ModeSelection"
				component={ModeSelectionScreen}
				options={{ title: 'Mode' }}
			/>
			<HomeStack.Screen
				name="Solo"
				component={SoloScreen}
				options={({ route }) => ({ title: `${route.params?.listName}` })}
			/>
			<HomeStack.Screen
				name="Buddy"
				component={BuddyScreen}
				options={({ route }) => ({ title: `${route.params?.listName}` })}
			/>
			<HomeStack.Screen
				name="SoloTutorial"
				component={SoloTutorialScreen}
				options={{ title: 'How to Play' }}
			/>
			<HomeStack.Screen
				name="BuddyTutorial"
				component={BuddyTutorialScreen}
				options={{ title: 'How to Play' }}
			/>
			<HomeStack.Screen
				name="MissedWords"
				component={MissedWordsScreen}
				options={{ title: 'Missed Words' }}
			/>
			<HomeStack.Screen
				name="EndSession"
				component={EndSessionScreen}
				options={{ headerShown: false }}
			/>
		</HomeStack.Navigator>
	);
};

export default HomeNavigation;
