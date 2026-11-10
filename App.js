import 'react-native-reanimated';
import './src/utils/webAlert';
import React, { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import { loadFontsAndAssets } from './src/utils/appInitialization';
import { defaultUserData } from './src/utils/defaultUserData';
import { checkNewUser } from './src/utils/HelperFunctions';
import { loadUserData, saveUserData, markLoginToday } from './src/utils/userData';
import { scheduleDailyReminder, parseReminderTime } from './src/utils/notifications';
import { getEffectiveStreak, todayString } from './src/utils/streakLogic.mjs';
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
				const isNewUser = await checkNewUser();
				setNewUser(isNewUser);

				if (!isNewUser) {
					const userData = await loadUserData();
					userData.numSessions++;
					await saveUserData(userData);
					await markLoginToday();

					if (Platform.OS !== 'web' && userData.settings.reminderEnabled) {
						const fresh = await loadUserData();
						const streakDays = getEffectiveStreak(fresh.streak, todayString());
						const { hour, minute } = parseReminderTime(fresh.settings.reminderTime);
						await scheduleDailyReminder(streakDays, hour, minute).catch(() => {});
					}
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
		await saveUserData(defaultUserData);
		setNewUser(false);
	}, []);

	const handleCustomSplashComplete = () => {
		setShowCustomSplash(false);
	};

	if (!appIsReady || newUser === null) {
		return null;
	}

	return (
		<>
			<NavigationContainer>
				<MainNavigator newUser={newUser} onIntroComplete={handleIntroComplete} />
			</NavigationContainer>
			{showCustomSplash && (
				<CustomSplashScreen onComplete={handleCustomSplashComplete} />
			)}
		</>
	);
}