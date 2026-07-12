import React from 'react';
import { View, StyleSheet } from 'react-native';
import { color, radii, space } from '../../theme';

const PADDING_BY_SIZE = {
    sm: space.md,
    md: space.lg,
    lg: space.xl,
};

const Card = ({ children, padding = 'md', elevated = true, style }) => (
    <View
        style={[
            styles.base,
            { backgroundColor: elevated ? color.surfaceElevated : color.surface },
            { padding: PADDING_BY_SIZE[padding] },
            style,
        ]}
    >
        {children}
    </View>
);

const styles = StyleSheet.create({
    base: {
        borderRadius: radii.lg,
    },
});

export default Card;
