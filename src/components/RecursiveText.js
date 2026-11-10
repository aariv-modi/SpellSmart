import React from 'react';
import { Text } from 'react-native';
import { HEADING_FONT } from '../utils/headingFont';

const RecursiveText = function ({ text, style, ...rest }) {
    return (
        <Text
            allowFontScaling={false}
            style={[{ fontFamily: HEADING_FONT, color: 'white' }, style]}
            {...rest}
        >
            {text}
        </Text>
    );
};

export default RecursiveText;
