import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';

export const createStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.md,
      borderWidth: 1.5,
      borderColor: colors.inputBorder,
      backgroundColor: colors.componentBase,
      height: 46,
      gap: Spacing.xs,
    },

    icon: {
      fontSize: 16,
    },

    label: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semiBold,
      color: colors.textPrimary,
    },
  });