import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';

import ListButton from '../components/ListButton';
import RecursiveText from '../components/RecursiveText';
import { getWordList } from '../utils/wordLists';
import { getCustomListNames, getCustomListLengths, getList } from '../utils/HelperFunctions';
import { scaleFont } from '../utils/responsiveTextSize';

const { width, height } = Dimensions.get('window');

const generateAlphabeticalListRanges = (list, gradeLevel) => {
    if (!list || list.length === 0) return { ranges: [], lengths: [] };

    const ranges = [];
    const lengths = [];
    const TARGET_GROUP_SIZE = 60;

    const letterGroups = {};
    list.forEach((word) => {
        const firstLetter = word.charAt(0).toUpperCase();
        if (!letterGroups[firstLetter]) letterGroups[firstLetter] = [];
        letterGroups[firstLetter].push(word);
    });

    const sortedLetters = Object.keys(letterGroups).sort();
    let currentRangeSize = 0;
    let currentStartLetter = sortedLetters[0];

    for (let i = 0; i < sortedLetters.length; i++) {
        const letter = sortedLetters[i];
        const letterGroupSize = letterGroups[letter].length;

        if (
            currentRangeSize > 0 &&
            Math.abs(currentRangeSize + letterGroupSize - TARGET_GROUP_SIZE) >
                Math.abs(currentRangeSize - TARGET_GROUP_SIZE)
        ) {
            ranges.push({
                id: `${currentStartLetter}-${sortedLetters[i - 1]}`,
                display:
                    currentStartLetter === sortedLetters[i - 1]
                        ? `Words starting with ${currentStartLetter}`
                        : `Words from ${currentStartLetter} to ${sortedLetters[i - 1]}`,
                technical: `UIL ${gradeLevel} ${currentStartLetter}${currentStartLetter === sortedLetters[i - 1] ? '' : `-${sortedLetters[i - 1]}`}`,
            });
            lengths.push(currentRangeSize);
            currentStartLetter = letter;
            currentRangeSize = letterGroupSize;
        } else {
            currentRangeSize += letterGroupSize;
        }

        if (i === sortedLetters.length - 1) {
            ranges.push({
                id: `${currentStartLetter}-${letter}`,
                display:
                    currentStartLetter === letter
                        ? `Words starting with ${currentStartLetter}`
                        : `Words from ${currentStartLetter} to ${letter}`,
                technical: `UIL ${gradeLevel} ${currentStartLetter}${currentStartLetter === letter ? '' : `-${letter}`}`,
            });
            lengths.push(currentRangeSize);
        }
    }

    return { ranges, lengths };
};

const ListSelectionScreen = ({ navigation, route }) => {
    const [listNames, updateListNames] = useState([]);
    const [listLengths, updateListLengths] = useState([]);
    const [uilList, setUilList] = useState(null);

    useEffect(() => {
        const getLists = async () => {
            if (route.params.listType === 'Custom') {
                updateListNames(await getCustomListNames());
                updateListLengths(await getCustomListLengths());
            } else if (route.params.listType === 'UIL') {
                const list = await getWordList(route.params.gradeLevel);
                setUilList(list);
                const { ranges, lengths } = generateAlphabeticalListRanges(
                    list,
                    route.params.gradeLevel,
                );
                updateListNames(ranges);
                updateListLengths(lengths);
            }
        };
        getLists();
    }, [route.params]);

    const handleSelection = async (item) => {
        let selectedListData;
        if (route.params.listType === 'Custom') {
            selectedListData = await getList(item);
        } else if (route.params.listType === 'UIL') {
            const list = uilList ?? (await getWordList(route.params.gradeLevel));
            const letterMatch = item.technical.match(/(\w)(?:-(\w))?$/);

            if (letterMatch) {
                const [, startLetter, endLetter] = letterMatch;
                selectedListData = list.filter((word) => {
                    const firstLetter = word.charAt(0).toUpperCase();
                    return !endLetter
                        ? firstLetter === startLetter
                        : firstLetter >= startLetter && firstLetter <= endLetter;
                });
            }
        }

        navigation.navigate('ModeSelection', {
            listName: item.technical || item,
            list: selectedListData,
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {route.params.listType === 'UIL' && (
                    <View style={styles.infoCard}>
                        <RecursiveText text="Practice Lists" style={styles.infoTitle} />
                        <RecursiveText
                            text="The official UIL word list has been divided into smaller groups based on the first letter of each word. Select any group to begin practicing!"
                            style={styles.infoText}
                        />
                    </View>
                )}

                {/* List Section */}
                <View style={styles.listContainer}>
                    <View style={styles.listHeaderContainer}>
                        <RecursiveText text="WORD GROUP" style={styles.listHeaderText} />
                        <RecursiveText text="COUNT" style={styles.listHeaderText} />
                    </View>
                    {listNames.map((item, index) => (
                        <ListButton
                            key={item.id || item}
                            onPress={() => handleSelection(item)}
                            title={item.display || item}
                            numWords={listLengths[index]}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    scrollContainer: {
        alignItems: 'center',
        paddingBottom: height * 0.05,
    },
    headerContainer: {
        width: width,
        marginTop: height * 0.07,
        paddingHorizontal: width * 0.05,
    },
    backButton: {
        position: 'absolute',
        left: width * 0.05,
        top: height * 0.02,
    },
    headerTextContainer: {
        alignItems: 'center',
        marginTop: height * 0.02,
    },
    headerTitle: {
        fontSize: scaleFont(32),
        marginBottom: height * 0.01,
    },
    headerSubtitle: {
        fontSize: scaleFont(24),
        color: '#ffc800',
    },
    infoCard: {
        backgroundColor: '#333333',
        width: height * 0.415,
        borderRadius: 15,
        padding: height * 0.023,
        marginTop: height * 0.03,
    },
    infoTitle: {
        fontSize: scaleFont(20),
        marginBottom: height * 0.01,
        color: '#ffc107',
    },
    infoText: {
        fontSize: scaleFont(16),
        lineHeight: scaleFont(24),
    },
    listContainer: {
        backgroundColor: '#333333',
        marginTop: height * 0.03,
        width: height * 0.415,
        borderRadius: 25,
        padding: height * 0.014,
    },
    listHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: height * 0.009,
        marginTop: height * 0.01,
    },
    listHeaderText: {
        fontSize: scaleFont(20),
    },
});

export default ListSelectionScreen;
