import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import RecursiveText from '../components/RecursiveText';
import InterText from '../components/InterText';
import { scaleFont } from '../utils/responsiveTextSize';

const { height, width } = Dimensions.get('window');

const BuddyTutorialScreen = ({ navigation, route }) => {
	const instructions = [
		"Have your buddy hold the phone away from you.",
		"The word will play out loud (check that silent mode is off!)",
		"Spell the word aloud, and your buddy will verify it - marking it either correct or incorrect.",
		"To bookmark the word, click the white bookmark icon.",
		"To hear the word again, click the blue button. To see your missed words, click the yellow button."
	];

	return (
		<View style={styles.container}>
			<View style={styles.instructionsContainer}>
				{instructions.map((instruction, index) => (
					<View key={index} style={styles.instructionBox}>
						<View style={styles.numberContainer}>
							<Text style={styles.numberText}>{index + 1}</Text>
						</View>
						<InterText text={instruction} style={styles.instructionText} />
					</View>
				))}
			</View>
			<Pressable onPress={() => navigation.navigate('Buddy', route.params)} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]}>
				<View style={styles.letsGoButton}>
					<RecursiveText text="START" style={styles.letsGoButtonText} />
				</View>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: height * 0.7,
		width: width,
		backgroundColor: "#1a1a1a",
		alignItems: 'center',
		justifyContent: 'center'
	},
	instructionsContainer: {
		width: height * 0.44,
		height: height * 0.6,
		justifyContent: 'space-evenly',
		alignItems: 'center'
	},
	instructionBox: {
		height: height * 0.1,
		width: height * 0.43,
		flexDirection: 'row',
		backgroundColor: '#2a2a2a',
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'space-evenly',
	},
	numberContainer: {
		width: height * 0.05,
		height: height * 0.05,
		borderRadius: 40,
		backgroundColor: '#3a3a3a',
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: height * 0.01
	},
	numberText: {
		color: 'white',
		fontSize: scaleFont(18),
		fontWeight: 'bold',
	},
	instructionText: {
		fontSize: scaleFont(16),
		marginLeft: height * 0.01,
		width: height * 0.33,
		alignSelf: 'center'
	},
	letsGoButton: {
		backgroundColor: '#1cb0f6', // Bright blue color
		height: height * 0.07,
		width: height * 0.2,
		borderRadius: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		alignItems: 'center',
		justifyContent: 'center'
	},
	letsGoButtonText: {
		fontSize: scaleFont(18),
	}
});

export default BuddyTutorialScreen;