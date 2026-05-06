import { StyleSheet } from 'react-native';
import { Typography, Radius } from '../theme';

export default StyleSheet.create({
  button: {
    borderRadius: Radius.lg,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
});
