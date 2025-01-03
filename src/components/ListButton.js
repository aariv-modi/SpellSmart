import React from "react"
import { Dimensions, Pressable, View } from "react-native"
import InterText from "./InterText";
import { scaleFont } from "../utils/responsiveTextSize";

const { width, height } = Dimensions.get('window');

const ListButton = function ({ title, onPress, numWords }) {
    return (
        <Pressable 
            onPress={onPress}
            style={({ pressed }) => [{
                opacity: pressed ? 0.7 : 1
            }]}
        >
            <View
                style={{
                    height: 0.06 * height,
                    backgroundColor: '#505050',
                    borderRadius: 15,
                    width: height * 0.39,
                    alignSelf: 'center',
                    marginTop: '5%',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}
            >
                <InterText text={title} style={{ fontSize: scaleFont(18), marginLeft: height * 0.014 }} />
                <InterText text={numWords} style={{ fontSize: scaleFont(18), marginRight: height * 0.014 }} />
            </View>
        </Pressable>
    )
}

export default ListButton