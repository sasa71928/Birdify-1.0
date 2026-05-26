import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';

export const createStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: Spacing.md,
    },

    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xs,
      marginLeft: 2,
    },

    label: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semiBold,
      color: colors.textPrimary,
    },

    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.componentBase,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      paddingHorizontal: Spacing.md,
      height: 48,
    },

    icon: {
      fontSize: 16,
      marginRight: Spacing.sm,
      opacity: 0.7,
      color: colors.textSecondary,
    },

    input: {
      flex: 1,
      fontSize: Typography.fontSize.md,
      color: colors.textPrimary,
      alignSelf: 'stretch',
    },

    toggle: {
      padding: Spacing.xs,
    },

    toggleIcon: {
      fontSize: 16,
      opacity: 0.6,
      color: colors.textSecondary,
    },

    labelRight: {
      marginTop: Spacing.xs,
      alignSelf: 'flex-end',
      marginRight: 4,
    },
  });