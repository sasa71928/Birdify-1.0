import { StyleSheet, Platform } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
    backgroundColor: colors.surface,
  },
  backBtn: {
    padding: 4,
    marginRight: Spacing.sm,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.componentBase,
  },
  headerGroupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerStatus: {
    fontSize: Typography.fontSize.xs,
    color: '#34A853',
    marginTop: 1,
  },
  headerAction: {
    padding: 4,
  },

  // Message list
  messageList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  dateLabelContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    backgroundColor: colors.componentBase,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  msgRow: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  msgRowMine: {
    alignItems: 'flex-end',
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 0,
  },
  msgAvatarTop: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    backgroundColor: colors.componentBase,
  },
  senderName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  bubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    overflow: 'visible',
  },
  bubbleWrapperMine: {
    flexDirection: 'row-reverse',
  },
  bubbleFlexContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    overflow: 'visible',
    flex: 1,
  },
  bubbleFlexContainerMine: {
    alignItems: 'flex-end',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: colors.componentBase,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    overflow: 'visible',
    alignSelf: 'flex-start',
  },
  bubbleTheirs: {
    backgroundColor: colors.componentBase,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: Radius.lg,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: Radius.lg,
  },
  bubbleGroup: {
    borderTopLeftRadius: 0,
  },
  bubbleHighlighted: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  // Reply Quotes in Bubbles
  replyQuote: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
  },
  replyQuoteTheirs: {
    backgroundColor: colors.componentBase,
    borderLeftColor: colors.primary,
  },
  replyQuoteMine: {
    backgroundColor: colors.componentBase,
    borderLeftColor: colors.primary,
  },
  replyQuoteUser: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  replyQuoteText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  replyQuoteImage: {
    width: 150,
    height: 100,
    borderRadius: Radius.sm,
    marginTop: 4,
  },

  // Input area
  inputContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border + '20',
    paddingBottom: Platform.OS === 'ios' ? 0 : 25, 
  },
  replyPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: colors.componentBase,
    gap: Spacing.sm,
  },
  replyPreviewLine: {
    width: 3,
    height: '100%',
    backgroundColor: colors.textPrimary,
    borderRadius: 2,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewUser: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  replyPreviewText: {
    fontSize: 11,
    color: colors.primary,
  },
  replyPreviewImageContainer: {
    marginTop: 4,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    width: 80,
    height: 80,
    backgroundColor: colors.componentBase,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replyPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedImagePreview: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  selectedImage: {
    width: 60,
    height: 60,
    borderRadius: Radius.sm,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: Spacing.md + 4,
    backgroundColor: colors.componentBase,
    borderRadius: 10,
  },
  bubbleImage: {
    width: 200,
    height: 160,
    borderRadius: Radius.md,
    marginBottom: 6,
    resizeMode: 'cover',
  },
  bubbleContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bubbleTextColumn: {
    width: 'auto',
    maxWidth: '80%',
  },
  bubbleTextWrapper: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  bubbleText: {
    fontSize: Typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: '#FFFFFF',
  },
  bubbleTime: {
    fontSize: 10,
    color: colors.placeholder,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeMine: {
    color: colors.springMoss,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border + '20',
    backgroundColor: colors.surface,
    gap: Spacing.sm,
  },
  attachBtn: {
    padding: 6,
    marginBottom: 2,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.componentBase,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    maxHeight: 120,
  },
  input: {
    fontSize: Typography.fontSize.sm,
    color: colors.textPrimary,
    padding: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: colors.placeholder,
  },
});

