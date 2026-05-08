import { StyleSheet } from 'react-native';
import { Colors } from '../../../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for bottom nav
  },
});

