import React, { useEffect, useRef } from 'react';
import { Animated, Image, Dimensions, StyleSheet, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const CustomSplashScreen = ({ onComplete }) => {
	const sheetPosition = useRef(new Animated.Value(0)).current;
	const beePosition = useRef(new Animated.ValueXY({ x: 0, y: height / 2 })).current;
	const beeScale = useRef(new Animated.Value(1)).current;
	const beeRotation = useRef(new Animated.Value(0)).current;
	const beeOpacity = useRef(new Animated.Value(1)).current;

	const spin = beeRotation.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg']
	});

	useEffect(() => {
		const moveDown = Animated.timing(beePosition.y, {
			toValue: height * 0.6,
			duration: 500,
			useNativeDriver: true,
		});

		const pullUpSequence = Animated.parallel([
			Animated.timing(beePosition.y, {
				toValue: -100,
				duration: 1200,
				useNativeDriver: true,
			}),
			Animated.timing(sheetPosition, {
				toValue: -height,
				duration: 900,
				useNativeDriver: true,
			}),
			Animated.timing(beeScale, {
				toValue: 0.5,
				duration: 900,
				useNativeDriver: true,
			}),
			Animated.timing(beeRotation, {
				toValue: 1,
				duration: 900,
				useNativeDriver: true,
			}),
			Animated.sequence([
				Animated.delay(600),
				Animated.timing(beeOpacity, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
			]),
		]);

		Animated.sequence([
			moveDown,
			Animated.delay(100),
			pullUpSequence,
		]).start(() => {
			onComplete?.();
		});
	}, []);

	return (
		<Animated.View
			pointerEvents="none"
			style={[styles.sheet, { transform: [{ translateY: sheetPosition }] }]}
		>
			<Animated.View
				style={[
					styles.beeContainer,
					{
						opacity: beeOpacity,
						left: '50%',
						transform: [
							{ translateY: beePosition.y },
							{ translateX: beePosition.x },
							{ scale: beeScale },
							{ rotate: spin },
						],
					},
				]}
			>
				<Image
					source={require('../../assets/images/android.jpg')}
					style={styles.beeLogo}
				/>
			</Animated.View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	sheet: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: '#1a1a1a',
		zIndex: 1000,
	},
	beeContainer: {
		position: 'absolute',
		width: 80,
		height: 80,
		marginLeft: -40,
		marginTop: -40,
		// Browsers don't size the logo from aspectRatio, so center it explicitly
		...Platform.select({ web: { alignItems: 'center', justifyContent: 'center' } }),
	},
	beeLogo: {
		height: height * 0.235,
		width: height * 0.235,
		aspectRatio: 1,
		resizeMode: 'contain',
	},
});

export default CustomSplashScreen;
