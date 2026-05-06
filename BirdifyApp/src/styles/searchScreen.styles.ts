import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  backBtn: {
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.componentBase,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: 6,
  },
  searchIcon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  filterBtn: {
    padding: 4,
  },

  // Scroll
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  clearAll: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },

  // Recent searches
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  recentText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },

  // Featured card
  featuredCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    height: 180,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(21, 66, 18, 0.65)',
  },
  featuredLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.springMoss,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.canvasPure,
  },

  // Category cards
  categoriesRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  categoryCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  categorySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Tags
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.componentBase,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
});

