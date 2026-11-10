import * as Font from 'expo-font';
import { Asset } from 'expo-asset';

import { HEADING_FONT_FILES } from './headingFont';

const FONTS = {
	'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
	'Recursive-Bold': require('../../assets/fonts/Recursive-Bold.ttf'),
	...HEADING_FONT_FILES,
	'Nunito-SemiBold': require('../../assets/fonts/Nunito-SemiBold.ttf'),
};

const IMAGES = {
	bee: require('../../assets/images/bee.png'),
	paintbrush: require('../../assets/images/paintbrush.png'),
	uil: require('../../assets/images/uil.png'),
	book: require('../../assets/images/book.png'),
	flex: require('../../assets/images/flex.png'),
	target: require('../../assets/images/target.png'),
	clipboard: require('../../assets/images/clipboard.png'),
	star: require('../../assets/images/star.png'),
	erm: require('../../assets/images/erm.png'),
	logo: require('../../assets/images/logo-512x512-r.png')
};

export async function loadFontsAndAssets() {
	await Promise.all([
		Font.loadAsync(FONTS),
		...Object.values(IMAGES).map(image =>
			Asset.fromModule(image).downloadAsync()
		)
	]);
}