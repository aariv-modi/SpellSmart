import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import RecursiveText from '../components/RecursiveText';
import InterText from '../components/InterText';
import { scaleFont } from '../utils/responsiveTextSize';

const TUTORIAL_INSTRUCTIONS = [
    'The word will play out loud (check that silent mode is off!)',
    'Type your best guess into the text box.',
    "If you're correct, you'll move on to the next word!",
    'If you didn\'t quite get it, the word will be added to the "Missed Words" section and you\'ll get another try.',
    'To repeat the word, click the speaker, and to bookmark the word for later review, click the bookmark.',
];

const { height, width } = Dimensions.get('window');

const InstructionStep = ({ number, instruction }) => (
    <View style={styles.instructionBox}>
        <View style={styles.numberContainer}>
            <Text style={styles.numberText}>{number}</Text>
        </View>
        <InterText text={instruction} style={styles.instructionText} />
    </View>
);

const SoloTutorialScreen = ({ navigation, route }) => {
    const handleNavigateToSolo = () => navigation.navigate('Solo', route.params);

    const instructionSteps = useMemo(
        () =>
            TUTORIAL_INSTRUCTIONS.map((instruction, index) => (
                <InstructionStep key={index} number={index + 1} instruction={instruction} />
            )),
        [],
    );

    return (
        <View style={styles.container}>
            <View style={styles.instructionsContainer}>{instructionSteps}</View>

            <Pressable
                onPress={handleNavigateToSolo}
                style={({ pressed }) => [styles.letsGoButton, pressed && styles.buttonPressed]}
            >
                <RecursiveText text="START" style={styles.letsGoButtonText} />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: height * 0.7,
        width: width,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructionsContainer: {
        width: height * 0.44,
        height: height * 0.6,
        justifyContent: 'space-evenly',
        alignItems: 'center',
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
        marginLeft: height * 0.01,
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
    },
    letsGoButton: {
        backgroundColor: '#1e90ff',
        height: height * 0.07,
        width: height * 0.2,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPressed: {
        opacity: 0.5,
    },
    letsGoButtonText: {
        fontSize: scaleFont(18),
    },
});

export default SoloTutorialScreen;
