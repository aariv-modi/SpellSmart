import { Alert, Platform } from 'react-native';

// react-native-web ships Alert.alert as a no-op, so validation messages
// ("Please enter a list name.") would silently vanish in the browser.
if (Platform.OS === 'web') {
    Alert.alert = (title, message) => {
        window.alert([title, message].filter(Boolean).join('\n\n'));
    };
}
