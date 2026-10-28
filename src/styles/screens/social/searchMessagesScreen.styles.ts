import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
    gap: Spacing.sm,
  },
  backBtn: {
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.componentBase,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
    paddingVertical: 0,
  },

  // Empty / idle state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Results
  resultsCount: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: Spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '15',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.componentBase,
  },
  groupAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#34A853',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  info: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  name: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  time: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  lastMessage: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  highlight: {
    backgroundColor: colors.springMoss + '50',
    color: colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
});

