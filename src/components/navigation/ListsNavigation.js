import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TopBar from '../TopBar';

import ListsScreen from '../../screens/ListsScreen';
import ListDetailsScreen from '../../screens/ListDetailsScreen';
import UploadListScreen from '../../screens/UploadListScreen';
import PasteListScreen from '../../screens/PasteListScreen';

const ListsStack = createStackNavigator();

const ListsNavigation = () => {
	return (
		<ListsStack.Navigator
			screenOptions={{
				header: (props) => <TopBar {...props} />,
			}}
		>
			<ListsStack.Screen
				name="ListsMain"
				component={ListsScreen}
				options={{ title: 'Lists', barColor: '#ce82ff' }}
			/>
			<ListsStack.Screen
				name="ListDetails"
				component={ListDetailsScreen}
				options={({ route }) => ({ title: route.params?.listName, barColor: '#ce82ff' })}
			/>
			<ListsStack.Screen
				name="UploadList"
				component={UploadListScreen}
				options={{ title: 'Upload Image', barColor: '#ce82ff' }}
			/>
			<ListsStack.Screen
				name="PasteList"
				component={PasteListScreen}
				options={{ title: 'Paste from Text', barColor: '#ce82ff' }}
			/>
		</ListsStack.Navigator>
	);
};

export default ListsNavigation;
