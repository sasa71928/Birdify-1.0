import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';

export default StyleSheet.create({
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
    color: Colors.textPrimary,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.sm,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    alignSelf: 'stretch', 
  },
  toggle: {
    padding: Spacing.xs,
  },
  toggleIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  labelRight: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
    marginRight: 4,
  },
});
