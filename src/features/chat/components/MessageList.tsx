import React, { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { ChatRow, ChatMessage } from '../types';
import { DateSeparator } from './DateSeparator';
import { UnreadSeparator } from './UnreadSeparator';
import { MessageRow } from './MessageRow';
import { TypingIndicator } from './TypingIndicator';
import { ScrollToBottomButton } from './ScrollToBottomButton';

export interface MessageListRef {
  scrollToBottom: (animated?: boolean) => void;
  scrollToIndex: (index: number, animated?: boolean) => void;
  scrollToMessageId: (id: string) => void;
}

interface MessageListProps {
  rows: ChatRow[];
  isOtherTyping?: boolean;
  onLoadOlder: () => void;
  hasMore: boolean;
  loadingOlder: boolean;
  onLongPressMessage: (message: ChatMessage) => void;
  onSwipeReply: (message: ChatMessage) => void;
  onReplyPress?: (replyToId: string) => void;
  onImagePress?: (url: string) => void;
  onToggleReaction: (emoji: string, messageId: string) => void;
  onRetryMessage?: (message: ChatMessage) => void;
  onDiscardMessage?: (messageId: string) => void;
}

export const MessageList = forwardRef<MessageListRef, MessageListProps>(
  (
    {
      rows,
      isOtherTyping = false,
      onLoadOlder,
      hasMore,
      loadingOlder,
      onLongPressMessage,
      onSwipeReply,
      onReplyPress,
      onImagePress,
      onToggleReaction,
      onRetryMessage,
      onDiscardMessage,
    },
    ref
  ) => {
    const listRef = useRef<FlashListRef<ChatRow>>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);

    useImperativeHandle(ref, () => ({
      scrollToBottom: (animated = true) => {
        listRef.current?.scrollToEnd({ animated });
        setShowScrollBottom(false);
      },
      scrollToIndex: (index: number, animated = true) => {
        if (index >= 0 && index < rows.length) {
          listRef.current?.scrollToIndex({ index, animated });
        }
      },
      scrollToMessageId: (messageId: string) => {
        const idx = rows.findIndex((r) => r.type === 'message' && r.message.id === messageId);
        if (idx !== -1) {
          listRef.current?.scrollToIndex({ index: idx, animated: true });
        }
      },
    }));

    const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
      const isAwayFromBottom = distanceFromBottom > 240;
      setShowScrollBottom(isAwayFromBottom);
    }, []);

    const getItemType = useCallback((item: ChatRow) => {
      if (item.type === 'date') return 'date';
      if (item.type === 'unread') return 'unread';
      return item.isMine ? 'mine' : 'theirs';
    }, []);

    const keyExtractor = useCallback((item: ChatRow) => item.key, []);

    const renderItem = useCallback(
      ({ item }: { item: ChatRow }) => {
        if (item.type === 'date') {
          return <DateSeparator label={item.label} />;
        }
        if (item.type === 'unread') {
          return <UnreadSeparator count={item.count} />;
        }
        return (
          <MessageRow
            message={item.message}
            isMine={item.isMine}
            isFirstInGroup={item.isFirstInGroup}
            isLastInGroup={item.isLastInGroup}
            showSenderName={item.showSenderName}
            onLongPress={onLongPressMessage}
            onSwipeReply={onSwipeReply}
            onReplyPress={onReplyPress}
            onImagePress={onImagePress}
            onToggleReaction={(emoji) => onToggleReaction(emoji, item.message.id)}
            onRetry={onRetryMessage ? () => onRetryMessage(item.message) : undefined}
            onDiscard={onDiscardMessage ? () => onDiscardMessage(item.message.id) : undefined}
          />
        );
      },
      [
        onLongPressMessage,
        onSwipeReply,
        onReplyPress,
        onImagePress,
        onToggleReaction,
        onRetryMessage,
        onDiscardMessage,
      ]
    );

    return (
      <View style={styles.container}>
        <FlashList
          ref={listRef}
          data={rows}
          renderItem={renderItem}
          getItemType={getItemType}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScroll={onScroll}
          scrollEventThrottle={32}
          maintainVisibleContentPosition={{
            startRenderingFromBottom: true,
            autoscrollToBottomThreshold: 0.15,
          }}
          onStartReached={onLoadOlder}
          onStartReachedThreshold={0.4}
          ListFooterComponent={isOtherTyping ? <TypingIndicator /> : null}
        />

        <ScrollToBottomButton
          visible={showScrollBottom}
          onPress={() => {
            listRef.current?.scrollToEnd({ animated: true });
            setShowScrollBottom(false);
          }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    paddingVertical: 12,
  },
});
