import React, { useEffect, useState } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    Dimensions,
    Pressable,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import RecursiveText from './RecursiveText';
import InterText from './InterText';
import { scaleFont } from '../utils/responsiveTextSize';
import { getDefinition } from '../utils/definitions';

const { width, height } = Dimensions.get('window');

const DefinitionModal = ({ word, visible, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible || !word) return;
        let cancelled = false;
        setLoading(true);
        setData(null);
        getDefinition(word).then((res) => {
            if (cancelled) return;
            setData(res);
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [visible, word]);

    const definitions = data?.definitions ?? [];
    const hasDefs = definitions.length > 0;

    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop}>
                    <TouchableWithoutFeedback>
                        <View style={styles.card}>
                            <RecursiveText text={word ?? ''} style={styles.word} />

                            {loading && (
                                <ActivityIndicator
                                    size="small"
                                    color="#ffc800"
                                    style={styles.loader}
                                />
                            )}

                            {!loading && hasDefs && (
                                <View style={styles.defsList}>
                                    {definitions.map((d, i) => (
                                        <View key={i} style={styles.defItem}>
                                            {d.partOfSpeech && (
                                                <InterText
                                                    text={d.partOfSpeech}
                                                    style={styles.partOfSpeech}
                                                />
                                            )}
                                            <InterText text={d.definition} style={styles.defText} />
                                        </View>
                                    ))}
                                </View>
                            )}

                            {!loading && !hasDefs && (
                                <InterText
                                    text={
                                        data === null
                                            ? "Couldn't load. Check your connection."
                                            : 'No definition found.'
                                    }
                                    style={styles.emptyText}
                                />
                            )}

                            <Pressable
                                onPress={onClose}
                                style={({ pressed }) => [
                                    styles.closeButton,
                                    pressed && styles.closeButtonPressed,
                                ]}
                            >
                                <InterText text="Close" style={styles.closeButtonText} />
                            </Pressable>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width * 0.06,
    },
    card: {
        width: '100%',
        backgroundColor: '#333333',
        borderRadius: 16,
        paddingVertical: height * 0.025,
        paddingHorizontal: width * 0.06,
        maxHeight: height * 0.7,
    },
    word: {
        fontSize: scaleFont(28),
        marginBottom: height * 0.018,
        alignSelf: 'center',
    },
    loader: {
        marginVertical: height * 0.03,
    },
    defsList: {
        marginBottom: height * 0.018,
    },
    defItem: {
        marginBottom: height * 0.014,
    },
    partOfSpeech: {
        fontSize: scaleFont(13),
        color: '#ffc800',
        marginBottom: height * 0.004,
    },
    defText: {
        fontSize: scaleFont(15),
        lineHeight: scaleFont(22),
        color: '#e8e8e8',
    },
    emptyText: {
        fontSize: scaleFont(15),
        color: '#b0b0b0',
        textAlign: 'center',
        marginVertical: height * 0.025,
    },
    closeButton: {
        alignSelf: 'center',
        paddingVertical: height * 0.012,
        paddingHorizontal: width * 0.08,
        marginTop: height * 0.005,
    },
    closeButtonPressed: {
        opacity: 0.6,
    },
    closeButtonText: {
        fontSize: scaleFont(15),
        color: '#1cb0f6',
    },
});

export default DefinitionModal;
