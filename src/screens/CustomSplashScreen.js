import React, { useEffect, useRef } from 'react';
import { Animated, Image, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const CustomSplashScreen = ({ children, onComplete }) => {
  // Animation values
  const beePosition = useRef(new Animated.ValueXY({ x: 0, y: height / 2 })).current; // Changed x to 0
  const mainScreenPosition = useRef(new Animated.Value(height)).current;
  const beeScale = useRef(new Animated.Value(1)).current;
  const beeRotation = useRef(new Animated.Value(0)).current;
  const beeOpacity = useRef(new Animated.Value(1)).current;

  // Convert rotation to degrees
  const spin = beeRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    // Move bee down slightly first
    const moveDown = Animated.timing(beePosition.y, {
      toValue: height * 0.6,
      duration: 500,
      useNativeDriver: true,
    });

    // Bee pulls screen up animation sequence
    const pullUpSequence = Animated.parallel([
      // Bee zooms up
      Animated.timing(beePosition.y, {
        toValue: -100,
        duration: 1200,
        useNativeDriver: true,
      }),
      // Main screen follows the bee
      Animated.timing(mainScreenPosition, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
      // Bee gets smaller as it goes up
      Animated.timing(beeScale, {
        toValue: 0.5,
        duration: 900,
        useNativeDriver: true,
      }),
      // Bee spins as it pulls
      Animated.timing(beeRotation, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      // Bee fades out near the end
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(beeOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Run the complete animation sequence
    Animated.sequence([
      moveDown,
      Animated.delay(100), // Pause before pulling
      pullUpSequence,
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Main screen content */}
      <Animated.View 
        style={[
          styles.mainContent,
          {
            transform: [{ translateY: mainScreenPosition }],
          }
        ]}
      >
        {children}
      </Animated.View>

      {/* Animated bee */}
      <Animated.View
        style={[
          styles.beeContainer,
          {
            opacity: beeOpacity,
            left: '50%', // Center horizontally
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
          source={require('../../assets/images/logo-512x512-r.png')}
          style={styles.beeLogo}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  mainContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
  },
  beeContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    marginLeft: -40, // Half of the width to center
    marginTop: -40,  // Half of the height to center
  },
  beeLogo: {
    height: height * 0.235,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
});

export default CustomSplashScreen;