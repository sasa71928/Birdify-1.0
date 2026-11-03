import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';
import { SwipeToReply } from './SwipeToReply';
import { Avatar } from '../../../components/ui/Avatar';
import { getSenderColor, Typography } from '../../../theme';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';

interface MessageRowProps {
  message: ChatMessage;
  isMine: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  showSenderName: boolean;
  onLongPress: (message: ChatMessage) => void;
  onSwipeReply: (message: ChatMessage) => void;
  onReplyPress?: (replyToId: string) => void;
  onImagePress?: (url: string) => void;
  onToggleReaction: (emoji: string) => void;
  onRetry?: () => void;
  onDiscard?: () => void;
}

export const MessageRow: React.FC<MessageRowProps> = React.memo(
  ({
    message,
    isMine,
    isFirstInGroup,
    isLastInGroup,
    showSenderName,
    onLongPress,
    onSwipeReply,
    onReplyPress,
    onImagePress,
    onToggleReaction,
    onRetry,
    onDiscard,
  }) => {
    const { isDark } = useDynamicStyles();
    const senderColor = getSenderColor(message.senderId, isDark);
    const senderDisplayName = message.sender?.fullname || message.sender?.username || 'Usuario';

    return (
      <View style={[styles.rowContainer, isMine ? styles.rowMine : styles.rowTheirs]}>
        {/* Avatar en grupos a la izquierda para mensajes ajenos */}
        {!isMine && (
          <View style={styles.avatarGutter}>
            {isFirstInGroup ? (
              <Avatar
                uri={message.sender?.profile_pic_url}
                name={senderDisplayName}
                size={30}
              />
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        <View style={[styles.bubbleColumn, isMine && styles.bubbleColumnMine]}>
          {/* Nombre de usuario en grupos */}
          {showSenderName && (
            <Text
              style={[
                styles.senderName,
                { color: senderColor, fontFamily: Typography.fontFamilyDisplay },
              ]}
              numberOfLines={1}
            >
              {senderDisplayName}
            </Text>
          )}

          <SwipeToReply isMine={isMine} onSwipe={() => onSwipeReply(message)}>
            <MessageBubble
              message={message}
              isMine={isMine}
              isFirstInGroup={isFirstInGroup}
              isLastInGroup={isLastInGroup}
              onLongPress={onLongPress}
              onReplyPress={onReplyPress}
              onImagePress={onImagePress}
              onToggleReaction={onToggleReaction}
              onRetry={onRetry}
              onDiscard={onDiscard}
            />
          </SwipeToReply>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginVertical: 1,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  avatarGutter: {
    width: 34,
    marginRight: 6,
    alignItems: 'center',
  },
  avatarSpacer: {
    width: 30,
    height: 30,
  },
  bubbleColumn: {
    maxWidth: '85%',
    alignItems: 'flex-start',
  },
  bubbleColumnMine: {
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 2,
    marginLeft: 10,
  },
});

