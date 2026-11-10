import React from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';

import { scaleFont } from '../utils/responsiveTextSize';

import InterText from '../components/InterText';

const { height } = Dimensions.get('window');

const MissedWordsScreen = ({ route }) => {
    const renderMissedWord = ({ item }) => <InterText text={item} style={styles.missedWordItem} />;

    return (
        <View style={styles.container}>
            <View style={styles.missedWordsContainer}>
                <FlatList
                    style={{ marginTop: height * 0.02 }}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    data={route.params.incorrectWords}
                    renderItem={renderMissedWord}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
    },
    missedWordsContainer: {
        height: height * 0.72,
        width: height * 0.415,
        borderRadius: 15,
        backgroundColor: '#333333',
        marginTop: height * 0.03,
    },
    missedWordsList: {
        marginTop: height * 0.02,
    },
    missedWordItem: {
        alignSelf: 'center',
        fontSize: scaleFont(24),
        marginTop: height * 0.007,
    },
});

export default MissedWordsScreen;
