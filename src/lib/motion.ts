import { Platform } from 'react-native';
/** The native driver is unavailable on web. */
export const nativeDriver = Platform.OS !== 'web';
