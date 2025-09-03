import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const scale = width / 375;

export const normalize = (size) => {
  const newSize = size * scale;
  return Platform.OS === 'ios'
    ? Math.round(newSize)
    : Math.round(newSize) - 2;
};

const textStyles = {
  h1: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: '#000', 
  },
  h2: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#000',
  },
  body: {
    fontSize: normalize(14),
    color: '#000',
  },
  caption: {
    fontSize: normalize(13),
    color: '#555',
  },
};

export default textStyles;

