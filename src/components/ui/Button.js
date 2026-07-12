import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import InterText from '../InterText';
import { color, radii, space, text } from '../../theme';

const VARIANT_STYLES = {
    primary: {
        bg: color.brand,
        textColor: color.text,
        border: null,
    },
    secondary: {
        bg: color.surfaceElevated,
        textColor: color.text,
        border: null,
    },
    ghost: {
        bg: 'transparent',
        textColor: color.textMuted,
        border: null,
    },
    danger: {
        bg: color.danger,
        textColor: color.text,
        border: null,
    },
};

const Button = ({
    label,
    onPress,
    variant = 'primary',
    icon = null,
    disabled = false,
    fullWidth = true,
    style,
}) => {
    const v = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            style={({ pressed }) => [
                styles.base,
                { backgroundColor: v.bg },
                v.border && { borderWidth: 1, borderColor: v.border },
                fullWidth && styles.fullWidth,
                disabled && styles.disabled,
                pressed && !disabled && styles.pressed,
                style,
            ]}
        >
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <InterText text={label} style={[styles.text, { color: v.textColor }]} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        paddingVertical: space.md,
        paddingHorizontal: space.xl,
        minHeight: 52,
    },
    fullWidth: {
        alignSelf: 'stretch',
    },
    text: {
        fontSize: text.body,
    },
    icon: {
        marginRight: space.sm,
    },
    pressed: {
        opacity: 0.75,
    },
    disabled: {
        opacity: 0.4,
    },
});

export default Button;
