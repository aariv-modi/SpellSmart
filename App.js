import 'react-native-reanimated';
import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadFontsAndAssets } from './src/utils/appInitialization';
import { defaultUserData } from './src/utils/defaultUserData';
import { checkNewUser } from './src/utils/HelperFunctions';
import CustomSplashScreen from './src/screens/CustomSplashScreen';

// Intro Screens
import IntroScreens from './src/screens/IntroScreens';
import BottomBar from './src/components/BottomBar';

// Prevent splash screen from auto-hiding
void SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

const MainNavigator = ({ newUser, onIntroComplete }) => {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false
			}}
			initialRouteName={newUser ? 'Intro' : 'Main'}
		>
			{newUser ? (
				<Stack.Screen name="Intro">
					{(props) => (
						<IntroScreens
							{...props}
							onIntroComplete={onIntroComplete}
						/>
					)}
				</Stack.Screen>
			) : (
				<Stack.Screen
					name="Main"
					component={BottomBar}
				/>
			)}
		</Stack.Navigator>
	);
};

export default function App() {
	const [appIsReady, setAppIsReady] = useState(false);
	const [showCustomSplash, setShowCustomSplash] = useState(true);
	const [newUser, setNewUser] = useState(null);

	useEffect(() => {
		const prepare = async () => {
			try {
				//await AsyncStorage.clear();
				const isNewUser = await checkNewUser();
				setNewUser(isNewUser);

				if (!isNewUser) {
					const userData = await AsyncStorage.getItem('userData');
					const parsedData = JSON.parse(userData);
					parsedData.numSessions++;

					await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
				}

				await loadFontsAndAssets();

				setAppIsReady(true);
				await SplashScreen.hideAsync();
			} catch (error) {
				console.warn(error);
			}
		};

		prepare();
	}, []);

	const handleIntroComplete = useCallback(async () => {
		await AsyncStorage.setItem('userData', JSON.stringify(defaultUserData));
		setNewUser(false);
	}, []);

	const handleCustomSplashComplete = () => {
		setShowCustomSplash(false);
	};

	if (!appIsReady || newUser === null) {
		return null;
	}

	return (
		<NavigationContainer>
			{showCustomSplash ? (
				<CustomSplashScreen onComplete={handleCustomSplashComplete}>
					<MainNavigator newUser={newUser} onIntroComplete={handleIntroComplete} />
				</CustomSplashScreen>
			) : (
				<MainNavigator newUser={newUser} onIntroComplete={handleIntroComplete} />
			)}
		</NavigationContainer>
	);
}