import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.componentBase,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
  },
  filtersWrapper: {
    marginBottom: Spacing.lg,
  },
  filtersScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: colors.componentBase,
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  birdCard: {
    backgroundColor: colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  imageContainer: {
    height: 160,
    width: '100%',
  },
  birdImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  birdInfo: {
    padding: Spacing.md,
  },
  birdName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

