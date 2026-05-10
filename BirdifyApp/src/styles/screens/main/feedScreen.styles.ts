import { StyleSheet } from 'react-native';
import { Colors } from '../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for bottom nav
  },
});

