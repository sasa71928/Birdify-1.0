import { StyleSheet, Platform } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.componentBase,
  },
  userText: {
    marginLeft: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  location: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,

    zIndex: 999,
    elevation: 999,

     pointerEvents: 'auto',
  },
  tagText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#5D4037',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    color: colors.textPrimary,
    marginLeft: 4,
    fontWeight: Typography.fontWeight.medium,
  },
  captionContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: Typography.lineHeight.tight,
  },
  captionUsername: {
    fontWeight: Typography.fontWeight.bold,
  },
  timeAgo: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  seeMore: {
    color: colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  modalOverlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    height: '75%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalDragArea: {
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  modalHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.componentBase,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  modalInputContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.componentBase,
    backgroundColor: colors.surface,
  },
  commentItem: {
    marginBottom: Spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commentUsername: {
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.sm,
    color: colors.textPrimary,
    marginRight: 4,
  },
  commentText: {
    fontSize: Typography.fontSize.sm,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  repliesContainer: {
    marginLeft: Spacing.xl,
    marginTop: 4,
  },
  viewRepliesButton: {
    paddingVertical: 2,
  },
  viewRepliesText: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  repliesList: {
    marginTop: 4,
  },
  replyItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  loadMoreText: {
    fontSize: Typography.fontSize.sm,
    color: colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  replyButton: {
    marginTop: 2,
    marginBottom: 4,
  },
  replyButtonText: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  commentInputContainer: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.componentBase,
    paddingTop: Spacing.sm,
  },
  replyingToBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.componentBase,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xs,
  },
  replyingToText: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.componentBase,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.sm,
    minHeight: 45,
  },
  commentInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  optionsContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: Spacing.md,
  },
  optionsList: {
    paddingTop: Spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  optionText: {
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
    marginLeft: Spacing.md,
    fontWeight: Typography.fontWeight.medium,
  },
  optionDivider: {
    height: 1,
    backgroundColor: colors.componentBase,
    marginVertical: Spacing.xs,
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
