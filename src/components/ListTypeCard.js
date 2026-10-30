import React from "react";
import { StyleSheet, Image, Dimensions, Pressable, View } from "react-native";
import RecursiveText from "./RecursiveText";
import InterText from "./InterText";
import { scaleFont } from "../utils/responsiveTextSize";

const { width, height } = Dimensions.get('window');

const ListTypeCard = function ({ title, image, aspectRatio, description, onTouch, disabled = false, style = {} }) {
    const handlePress = () => {
        // Always call onTouch, let the parent component handle the disabled state
        onTouch();
    };

    return (
        <Pressable onPress={handlePress}>
            <View
                style={[
                    styles.card,
                    { backgroundColor: true ? '#333333' : 'white', opacity: disabled ? 0.5 : 1 },
                    style
                ]}
            >
                <Image
                    source={image}
                    style={[
                        styles.image,
                        { aspectRatio: aspectRatio, width: height * 0.08 * aspectRatio },
                        disabled && { opacity: 0.5 }
                    ]}
                />
                <RecursiveText
                    text={title}
                    style={[
                        styles.title,
                        disabled && { opacity: 0.5 }
                    ]}
                />
                <InterText
                    text={description}
                    style={[
                        styles.description,
                        disabled && { opacity: 0.5 }
                    ]}
                />
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        height: height * 0.29,
        width: height * 0.21,
        boxShadow: '0px 2px 10px rgba(3,3,3,0.2)',
        borderRadius: 15,
    },
    image: {
        height: height * 0.08,
        marginTop: height * 0.03,
        alignSelf: 'center'
    },
    title: {
        alignSelf: 'center',
        fontSize: scaleFont(18),
        marginTop: height * 0.03,
        color: true ? '#ffc800' : '#1cb0f6'
    },
    description: {
        alignSelf: 'center',
        textAlign: 'center',
        marginTop: height * 0.025,
        width: height * 0.18,
        fontSize: scaleFont(13),
        color: true ? 'white' : '#424242'
    }
});

export default ListTypeCard;