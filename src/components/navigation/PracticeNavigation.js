import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Main Practice Screen
import ListTypeScreen from '../../screens/ListTypeScreen';
import ListSelectionScreen from '../../screens/ListSelectionScreen';
import ModeSelectionScreen from '../../screens/ModeSelectionScreen';
import SoloScreen from '../../screens/SoloScreen';
import SoloTutorialScreen from '../../screens/SoloTutorial';
import BuddyScreen from '../../screens/BuddyScreen';
import BuddyTutorialScreen from '../../screens/BuddyTutorial';
import MissedWordsScreen from '../../screens/MissedWordsScreen';
import PracticeScreen from '../../screens/PracticeScreen';
import TopBar from '../../components/TopBar';

const PracticeStack = createStackNavigator();

const PracticeNavigation = () => {
	return (
		<PracticeStack.Navigator
			screenOptions={{
				header: (props) => <TopBar {...props} />,
			}}
		>
			<PracticeStack.Screen
				name="ListType"
				component={ListTypeScreen}
				options={{ unmountOnBlur: true, title: 'Practice' }}
			/>
			<PracticeStack.Screen
				name="ListSelection"
				component={ListSelectionScreen}
				options={({ route }) => ({
					title: route.params?.gradeLevel ? `UIL ${route.params?.gradeLevel}` : 'Custom Lists'
				})}
			/>
			<PracticeStack.Screen
				name="ModeSelection"
				component={ModeSelectionScreen}
				options={{ title: 'Mode' }}
			/>
			<PracticeStack.Screen
				name="Solo"
				component={SoloScreen}
				options={({ route }) => ({
					title: `${route.params?.listName}`
				})}
			/>
			<PracticeStack.Screen
				name="Buddy"
				component={BuddyScreen}
				options={({ route }) => ({
					title: `${route.params?.listName}`
				})}
			/>
			<PracticeStack.Screen
				name="SoloTutorial"
				component={SoloTutorialScreen}
				options={{ title: 'How to Play' }}
			/>
			<PracticeStack.Screen
				name="BuddyTutorial"
				component={BuddyTutorialScreen}
				options={{ title: 'How to Play' }}
			/>
			<PracticeStack.Screen
				name="MissedWords"
				component={MissedWordsScreen}
				options={{ title: 'Missed Words' }}
			/>
		</PracticeStack.Navigator>
	);
};

export default PracticeNavigation;