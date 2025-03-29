import { Platform, StatusBar, Dimensions } from 'react-native';
import {
    isIphoneX,
    getBottomSpace,
    getStatusBarHeight,
} from 'react-native-iphone-x-helper';
import DeviceInfo from 'react-native-device-info';

const { height, width } = Dimensions.get('window');
const guidelineBaseWidth = 360;
const guidelineBaseHeight = 592;
const standardLength = width > height ? width : height;
const offset =
    width > height ? 0 : Platform.OS === 'ios' ? 78 : StatusBar.currentHeight ? StatusBar.currentHeight : 0;

const deviceHeight =
    isIphoneX() || Platform.OS === 'android'
        ? standardLength - offset
        : standardLength;

export { width, height };

// padding, margin, fontSize, ....
export const scale = (size: number) => (width / guidelineBaseWidth) * size;
