import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 66, 18, 0.25)', // Forest Green tint overlay
    padding: Spacing.xl,
    justifyContent: 'flex-end',
  },
  content: {
    marginBottom: Spacing.xxl * 2,
  },
  title: {
    fontSize: 42,
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.canvasPure,
    lineHeight: 52,
  },
  footer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  signUpButton: {
    backgroundColor: Colors.canvasPure,
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: Typography.fontSize.md,
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.primary,    // Forest Green
  },
  loginButton: {
    backgroundColor: Colors.container, // Misty Pine
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: Typography.fontSize.md,
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.canvasPure,
  },
});

