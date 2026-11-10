import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image, Pressable, Platform } from 'react-native';
import Swiper from 'react-native-swiper';
import RecursiveText from '../components/RecursiveText';
import InterText from '../components/InterText';
import { scaleFont } from '../utils/responsiveTextSize';

const logo = require('../../assets/images/logo-512x512-r.png');
const modes = require('../../assets/images/modes2.png');
const uil = require('../../assets/images/uil.png');
const list = require('../../assets/images/list.png');

const { width, height } = Dimensions.get('window');

const IntroScreens = ({ onIntroComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const swiperRef = useRef(null); // Create a ref for the Swiper

    const introPages = [
        {
            title1: 'WELCOME TO',
            title2: 'SPELLSMART!',
            title3: '',
            description: "We're excited to have you here!",
            backgroundColor: '#1a1a1a',
            image: logo,
            imageAspectRatio: 512 / 512,
            imageHeight: height * 0.3,
        },
        {
            title1: 'LEARN SPELLING',
            title2: 'YOUR WAY',
            title3: '',
            description:
                'You can fly solo or have a friend help you out, whichever is best for you!',
            backgroundColor: '#1a1a1a',
            image: modes,
            imageAspectRatio: 809 / 308,
            imageHeight: height * 0.15,
        },
        {
            title1: 'LOCK IN FOR',
            title2: 'UIL SPELLING',
            title3: '',
            description:
                'UIL is one of the most prestigious spelling competitions in Texas and a great way to test your spelling skills!',
            backgroundColor: '#1a1a1a',
            image: uil,
            imageAspectRatio: 1040 / 756,
            imageHeight: height * 0.2,
        },
        {
            title1: 'CREATE',
            title2: 'CUSTOMIZE',
            title3: 'CONQUER',
            description: 'Feel free to create your own spelling lists to practice with as well!',
            backgroundColor: '#1a1a1a',
            image: list,
            imageAspectRatio: 461 / 387,
            imageHeight: height * 0.2,
        },
    ];

    const handleSwipeIndexChanged = (index) => {
        setCurrentIndex(index);
    };

    const renderPage = (page, index) => (
        <View key={index} style={[styles.page, { backgroundColor: page.backgroundColor }]}>
            <View
                style={{
                    height: height * 0.3,
                    marginTop: 0.12 * height,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Image
                    source={page.image}
                    style={{
                        aspectRatio: page.imageAspectRatio,
                        height: page.imageHeight,
                        width: page.imageHeight * page.imageAspectRatio,
                    }}
                />
            </View>
            <View style={{ height: 0.2 * height, justifyContent: 'center', alignItems: 'center' }}>
                <RecursiveText text={page.title1} style={{ fontSize: scaleFont(42) }} />
                <RecursiveText text={page.title2} style={{ fontSize: scaleFont(42) }} />
                {page.title3 ? (
                    <RecursiveText text={page.title3} style={{ fontSize: scaleFont(42) }} />
                ) : null}
            </View>
            <InterText style={styles.description} text={page.description} />
        </View>
    );

    const handleComplete = () => {
        onIntroComplete();
    };

    const handleNext = () => {
        if (currentIndex === introPages.length - 1) {
            handleComplete();
        } else if (Platform.OS === 'web') {
            setCurrentIndex(currentIndex + 1);
        } else {
            swiperRef.current.scrollBy(1);
        }
    };

    return (
        <View style={styles.container}>
            {/* react-native-swiper doesn't work in browsers, so web shows one page at a time */}
            {Platform.OS === 'web' ? (
                <View style={styles.container}>
                    {renderPage(introPages[currentIndex], currentIndex)}
                    <View style={[styles.pagination, styles.webPagination]}>
                        {introPages.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.paginationDot,
                                    styles.webDot,
                                    {
                                        backgroundColor:
                                            i === currentIndex
                                                ? '#58cc02'
                                                : 'rgba(255,255,255,0.3)',
                                    },
                                ]}
                            />
                        ))}
                    </View>
                </View>
            ) : (
                <Swiper
                    ref={swiperRef} // Add ref to the Swiper
                    loop={false}
                    onIndexChanged={handleSwipeIndexChanged}
                    showsPagination={true}
                    dotColor="rgba(255,255,255,0.3)"
                    activeDotColor="#58cc02"
                    dotStyle={styles.paginationDot}
                    activeDotStyle={styles.paginationDot}
                    paginationStyle={styles.pagination}
                >
                    {introPages.map(renderPage)}
                </Swiper>
            )}

            {/* Bottom navigation bar */}
            <View style={styles.bottomBar}>
                <Pressable
                    onPress={handleNext}
                    style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]}
                >
                    <View style={styles.bottomButton}>
                        <InterText
                            style={{ alignSelf: 'center', fontSize: scaleFont(18) }}
                            text={currentIndex === introPages.length - 1 ? "Let's Go!" : 'Next'}
                        />
                    </View>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    page: {
        flex: 1,
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    description: {
        fontSize: scaleFont(20),
        color: 'white',
        textAlign: 'center',
        marginTop: height * 0.04,
        paddingHorizontal: 20,
        width: height * 0.461,
    },
    pagination: {
        bottom: height * 0.176,
    },
    webPagination: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    webDot: {
        marginHorizontal: 3,
    },
    paginationDot: {
        height: height * 0.023,
        width: height * 0.047,
        borderRadius: 50,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        width: width,
        alignItems: 'center',
        height: height * 0.15,
        backgroundColor: '#333333',
        justifyContent: 'center',
    },
    bottomButton: {
        backgroundColor: '#58cc02',
        borderRadius: 25,
        height: height * 0.07,
        width: width * 0.9,
        justifyContent: 'center',
    },
});

export default IntroScreens;
