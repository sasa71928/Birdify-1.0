import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../theme';
import { CommentsSkeleton } from '../skeleton';
import { useT } from '../../i18n';
import { Comment } from '../FeedItem';

interface FeedCommentsModalProps {
  visible: boolean;
  onClose: () => void;
  commentsList: Comment[];
  loadingComments: boolean;
  visibleCommentsCount: number;
  setVisibleCommentsCount: React.Dispatch<React.SetStateAction<number>>;
  expandedComments: Record<string, boolean>;
  toggleCommentExpansion: (commentId: string) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  replyingTo: { id: string; username: string; parentId: string | null } | null;
  setReplyingTo: (val: { id: string; username: string; parentId: string | null } | null) => void;
  onCommentSubmit: () => void;
  isOffline: boolean;
  postSyncStatus?: string;
  navigation: any;
  onNavigateAway?: () => void;
  styles: any;
  colors: any;
}

export const FeedCommentsModal: React.FC<FeedCommentsModalProps> = React.memo(({
  visible,
  onClose,
  commentsList,
  loadingComments,
  visibleCommentsCount,
  setVisibleCommentsCount,
  expandedComments,
  toggleCommentExpansion,
  commentText,
  setCommentText,
  replyingTo,
  setReplyingTo,
  onCommentSubmit,
  isOffline,
  postSyncStatus,
  navigation,
  onNavigateAway,
  styles,
  colors,
}) => {
  const { t } = useT();
  const screenHeight = Dimensions.get('window').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const resetModal = useCallback(() => {
    Animated.timing(panY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose, panY, screenHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          resetModal();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const backdropOpacity = panY.interpolate({
    inputRange: [0, screenHeight],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (visible) {
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      panY.setValue(screenHeight);
    }
  }, [visible, panY, screenHeight]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={resetModal}
    >
      <View style={styles.modalOverlayContainer}>
        <Animated.View style={[styles.modalOverlay, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={resetModal}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          style={[styles.modalContent, { transform: [{ translateY: panY }] }]}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            {/* Draggable Header */}
            <View {...panResponder.panHandlers} style={styles.modalDragArea}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('feed.commentsModalTitle')}</Text>
              </View>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {loadingComments ? (
                <CommentsSkeleton count={4} />
              ) : commentsList.length === 0 ? (
                <View style={{ paddingVertical: 40, justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="chatbubbles-outline" size={32} color={colors.primary + '80'} />
                  <Text
                    style={{
                      marginTop: 10,
                      color: Colors.textSecondary,
                      fontSize: 14,
                      textAlign: 'center',
                    }}
                  >
                    {t('feed.noCommentsYet')}
                  </Text>
                </View>
              ) : (
                commentsList.slice(0, visibleCommentsCount).map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <TouchableOpacity
                        onPress={() => {
                          if (comment.userId) {
                            resetModal();
                            onNavigateAway?.();
                            navigation.navigate('Profile', { userId: comment.userId });
                          }
                        }}
                      >
                        <Text style={styles.commentUsername}>{comment.username}</Text>
                      </TouchableOpacity>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>

                    {!(isOffline && postSyncStatus !== 'pending') && (
                      <TouchableOpacity
                        onPress={() =>
                          setReplyingTo({
                            id: comment.id,
                            username: comment.username,
                            parentId: null,
                          })
                        }
                        style={styles.replyButton}
                      >
                        <Text style={styles.replyButtonText}>{t('feed.reply')}</Text>
                      </TouchableOpacity>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                      <View style={styles.repliesContainer}>
                        <TouchableOpacity
                          onPress={() => toggleCommentExpansion(comment.id)}
                          style={styles.viewRepliesButton}
                        >
                          <Text style={styles.viewRepliesText}>
                            {expandedComments[comment.id]
                              ? t('feed.hideReplies')
                              : t('feed.viewReplies', { count: comment.replies.length })}
                          </Text>
                        </TouchableOpacity>

                        {expandedComments[comment.id] && (
                          <View style={styles.repliesList}>
                            {comment.replies.map((reply) => (
                              <View key={reply.id} style={{ marginBottom: Spacing.sm }}>
                                <View style={styles.replyItem}>
                                  <TouchableOpacity
                                    onPress={() => {
                                      if (reply.userId) {
                                        resetModal();
                                        onNavigateAway?.();
                                        navigation.navigate('Profile', { userId: reply.userId });
                                      }
                                    }}
                                  >
                                    <Text style={styles.commentUsername}>{reply.username}</Text>
                                  </TouchableOpacity>
                                  <Text style={styles.commentText}>{reply.text}</Text>
                                </View>
                                {!(isOffline && postSyncStatus !== 'pending') && (
                                  <TouchableOpacity
                                    onPress={() =>
                                      setReplyingTo({
                                        id: reply.id,
                                        username: reply.username,
                                        parentId: comment.id,
                                      })
                                    }
                                    style={styles.replyButton}
                                  >
                                    <Text style={styles.replyButtonText}>{t('feed.reply')}</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))
              )}

              {!loadingComments && commentsList.length > visibleCommentsCount && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={() => setVisibleCommentsCount((prev) => prev + 5)}
                >
                  <Text style={styles.loadMoreText}>{t('feed.loadMoreComments')}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Input Area */}
            <View
              style={[
                styles.modalInputContainer,
                Platform.OS === 'android' && keyboardHeight > 0 && { paddingBottom: keyboardHeight },
              ]}
            >
              {replyingTo && (
                <View style={styles.replyingToBadge}>
                  <Text style={styles.replyingToText}>
                    {t('feed.replyingTo', { username: replyingTo.username })}
                  </Text>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.inputRow}>
                {isOffline && postSyncStatus !== 'pending' ? (
                  <Text
                    style={[
                      styles.commentInput,
                      { color: Colors.textSecondary, textAlignVertical: 'center', paddingTop: 12 },
                    ]}
                  >
                    {t('feed.commentsDisabledOffline')}
                  </Text>
                ) : (
                  <>
                    <TextInput
                      style={styles.commentInput}
                      placeholder={
                        replyingTo
                          ? t('feed.writeReplyPlaceholder')
                          : t('feed.writeComment')
                      }
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        !commentText.trim() && styles.sendButtonDisabled,
                      ]}
                      onPress={onCommentSubmit}
                      disabled={!commentText.trim()}
                    >
                      <Ionicons
                        name="send"
                        size={20}
                        color={commentText.trim() ? Colors.primary : Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
});
