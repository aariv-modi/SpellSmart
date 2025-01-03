import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TopBar from '../TopBar';

// Main Bookmarks Screen
import BookmarksScreen from '../../screens/BookmarksScreen';

const BookmarksStack = createStackNavigator();

const BookmarksNavigation = () => {
	return (
		<BookmarksStack.Navigator
			screenOptions={{
				header: (props) => <TopBar {...props} />,
			}}
		>
			<BookmarksStack.Screen
				name="BookmarksMain"
				component={BookmarksScreen}
				options={{ title: 'Bookmarks', barColor: '#ff9600' }}
			/>
		</BookmarksStack.Navigator>
	);
};

export default BookmarksNavigation;