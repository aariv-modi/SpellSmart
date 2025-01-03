import React, { useState } from 'react';
import { View, Dimensions, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InterText from '../components/InterText';
import { scaleFont } from '../utils/responsiveTextSize';

const { width, height } = Dimensions.get('window');

const FAQItem = ({ question, answer }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Pressable onPress={() => setIsExpanded(!isExpanded)}  style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]}>
            <View style={styles.faqItem}>
                <View style={styles.faqHeader}>
                    <InterText
                        style={styles.faqQuestion}
                        text={question}
                    />
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="white"
                    />
                </View>
                {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                        <InterText
                            style={styles.faqAnswer}
                            text={answer}
                        />
                    </View>
                )}
            </View>
        </Pressable>
    );
};

const HelpScreen = () => {
    const faqs = [
        {
            question: "How do I create a new list?",
            answer: "Tap the '+' button on the Lists tab to create a new list. Enter a name for your list and start adding words."
        },
        {
            question: "Can I delete a list?",
            answer: "Navigate to the list details screen and look for the delete option in the top menu or list settings."
        },
        {
            question: "How do I add words to a list?",
            answer: "In the list details screen, tap the floating action button ('+') to open the add word modal. Enter the word and tap 'OK'."
        },
        {
            question: "Can I remove words from a list?",
            answer: "In the list details screen, tap the 'X' icon next to any word to remove it from the list."
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.faqContainer}>
                {faqs.map((faq, index) => (
                    <FAQItem
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: height,
        width: width,
        backgroundColor: "#1a1a1a",
        alignItems: 'center'
    },
    faqContainer: {
        height: height * 0.7,
        marginTop: height * 0.01,
        width: height * 0.41
    },
    faqItem: {
        backgroundColor: '#2c2c2c',
        borderRadius: 10,
        marginTop: height * 0.015,
        padding: 15,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    faqQuestion: {
        fontSize: scaleFont(17),
        marginRight: height * 0.01
    },
    faqAnswerContainer: {
        marginTop: height * 0.01,
        borderTopWidth: 1,
        borderTopColor: '#505050',
        paddingTop: height * 0.01
    },
    faqAnswer: {
        fontSize: scaleFont(16),
        color: '#b0b0b0'
    }
});

export default HelpScreen;