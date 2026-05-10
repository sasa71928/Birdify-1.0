import { StyleSheet, Platform } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../../theme';

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.componentBase,
  },
  headerGroupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.componentBase,
  },
  senderName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  bubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  bubbleWrapperMine: {
    flexDirection: 'row-reverse',
  },
  bubbleFlexContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
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
    backgroundColor: Colors.componentBase,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    overflow: 'hidden',
  },
  bubbleTheirs: {
    backgroundColor: '#E2E2E2', // Darker grey as requested
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: Radius.lg,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: Radius.lg,
  },
  
  // Reply Quotes in Bubbles
  replyQuote: {
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  replyQuoteTheirs: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderLeftColor: Colors.textSecondary,
  },
  replyQuoteMine: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderLeftColor: Colors.canvasPure,
  },
  replyQuoteUser: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  replyQuoteText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  // Input area
  inputContainer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingBottom: Platform.OS === 'ios' ? 0 : 25, // Avoid system buttons on Android
  },
  replyPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F8F9FA',
    gap: Spacing.sm,
  },
  replyPreviewLine: {
    width: 3,
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewUser: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  replyPreviewText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  bubbleImage: {
    width: 200,
    height: 160,
    borderRadius: Radius.md,
    marginBottom: 6,
  },
  bubbleText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: Colors.canvasPure,
  },
  bubbleTime: {
    fontSize: 10,
    color: Colors.outlineGrey,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeMine: {
    color: Colors.springMoss,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  attachBtn: {
    padding: 6,
    marginBottom: 2,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.componentBase,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    maxHeight: 120,
  },
  input: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    padding: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.outlineGrey,
  },
});

