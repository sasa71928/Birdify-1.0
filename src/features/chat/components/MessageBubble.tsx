import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../types';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius, Typography, Shadows } from '../../../theme';
import { ReplyQuote } from './ReplyQuote';
import { ImageAttachment } from './ImageAttachment';
import { MessageStatus } from './MessageStatus';
import { ReactionChips } from './ReactionChips';
import { useT } from '../../../i18n';

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onLongPress: (message: ChatMessage) => void;
  onReplyPress?: (replyToId: string) => void;
  onImagePress?: (url: string) => void;
  onToggleReaction: (emoji: string) => void;
  onRetry?: () => void;
  onDiscard?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({
    message,
    isMine,
    isFirstInGroup,
    isLastInGroup,
    onLongPress,
    onReplyPress,
    onImagePress,
    onToggleReaction,
    onRetry,
    onDiscard,
  }) => {
    const { colors } = useDynamicStyles();
    const { t } = useT();

    // Bordes según posición en el grupo
    const bubbleRadius = Radius.lg;
    const sharpCorner = 4;

    const topLeftRadius = isMine ? bubbleRadius : isFirstInGroup ? bubbleRadius : sharpCorner;
    const bottomLeftRadius = isMine ? bubbleRadius : isLastInGroup ? sharpCorner : sharpCorner;
    const topRightRadius = !isMine ? bubbleRadius : isFirstInGroup ? bubbleRadius : sharpCorner;
    const bottomRightRadius = !isMine ? bubbleRadius : isLastInGroup ? sharpCorner : sharpCorner;

    const bgColor = isMine ? colors.bubbleMine : colors.bubbleTheirs;
    const textColor = isMine ? colors.bubbleMineText : colors.bubbleTheirsText;

    const hasImage = Boolean(message.imagePath || message.localImageUri);
    const hasText = Boolean(message.text && message.text.trim().length > 0);

    return (
      <View style={[styles.wrapper, isMine ? styles.wrapperMine : styles.wrapperTheirs]}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: bgColor,
              borderTopLeftRadius: topLeftRadius,
              borderBottomLeftRadius: bottomLeftRadius,
              borderTopRightRadius: topRightRadius,
              borderBottomRightRadius: bottomRightRadius,
              borderColor: isMine ? 'transparent' : colors.bubbleBorder,
              borderWidth: isMine ? 0 : 1,
              paddingHorizontal: hasImage ? 4 : 12,
              paddingTop: hasImage ? 4 : 8,
              paddingBottom: hasImage ? 5 : 7,
            },
            !isMine && Shadows.card,
          ]}
        >
          {message.isDeleted ? (
            <TouchableOpacity
              activeOpacity={0.88}
              onLongPress={() => onLongPress(message)}
              delayLongPress={220}
            >
              <View style={styles.deletedRow}>
                <Ionicons
                  name="ban-outline"
                  size={14}
                  color={isMine ? colors.bubbleMineMeta : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.deletedText,
                    { color: isMine ? colors.bubbleMineMeta : colors.textSecondary },
                  ]}
                >
                  {t('chat.deletedMessage')}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <>
              {/* Cita de mensaje respondido */}
              {message.replyTo && (
                <ReplyQuote
                  reply={message.replyTo}
                  isMine={isMine}
                  onPress={() => onReplyPress && onReplyPress(message.replyTo!.id)}
                />
              )}

              {/* Imagen adjunta */}
              {(message.imagePath || message.localImageUri) && (
                <ImageAttachment
                  imagePath={message.imagePath}
                  localUri={message.localImageUri}
                  imageWidth={message.imageWidth}
                  imageHeight={message.imageHeight}
                  isUploading={message.status === 'sending'}
                  onPress={() => {
                    const targetUri = message.imagePath || message.localImageUri;
                    if (targetUri && onImagePress) {
                      onImagePress(targetUri);
                    }
                  }}
                  onLongPress={() => onLongPress(message)}
                />
              )}

              {/* Texto y pie (hora / status) */}
              <TouchableOpacity
                activeOpacity={0.88}
                onLongPress={() => onLongPress(message)}
                delayLongPress={220}
              >
                <View
                  style={[
                    styles.contentAndMeta,
                    hasImage && {
                      paddingHorizontal: 6,
                      paddingTop: hasText ? 6 : 2,
                      paddingBottom: 2,
                    },
                  ]}
                >
                  {Boolean(message.text) && (
                    <Text
                      style={[
                        styles.bodyText,
                        { color: textColor, fontFamily: Typography.fontFamilyBody },
                      ]}
                    >
                      {message.text}
                    </Text>
                  )}

                  <MessageStatus
                    status={message.status}
                    createdAt={message.createdAt}
                    isMine={isMine}
                    onRetry={onRetry}
                    onDiscard={onDiscard}
                  />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Reacciones */}
        <ReactionChips
          reactions={message.reactions}
          isMine={isMine}
          onToggleReaction={onToggleReaction}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: '100%',
    marginVertical: 1.5,
  },
  wrapperMine: {
    alignSelf: 'flex-end',
  },
  wrapperTheirs: {
    alignSelf: 'flex-start',
  },
  bubble: {
    overflow: 'hidden',
  },
  contentAndMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bodyText: {
    fontSize: 14.5,
    lineHeight: 20.5,
    flexShrink: 1,
  },
  deletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  deletedText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});

