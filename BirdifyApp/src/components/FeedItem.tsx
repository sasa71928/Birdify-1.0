import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, PanResponder, Animated, Dimensions, TouchableWithoutFeedback, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles/components/FeedItem.styles';

export interface Comment {
  id: string;
  username: string;
  text: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  username: string;
  userAvatar: string;
  location: string;
  image: string;
  tag: string;
  likes: number;
  comments: number;
  caption: string;
  timeAgo: string;
  isVerified?: boolean;
  commentsList?: Comment[];
}

interface FeedItemProps {
  post: Post;
}

const CAPTION_LIMIT = 100;
const INITIAL_COMMENTS_DISPLAY = 5;

export default function FeedItem({ post }: FeedItemProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isCaptionExpanded, setIsCaptionExpanded] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = React.useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = React.useState(INITIAL_COMMENTS_DISPLAY);
  const [liked, setLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(post.likes);
  const [showHeartAnimation, setShowHeartAnimation] = React.useState(false);
  const heartScale = React.useRef(new Animated.Value(0)).current;
  const heartOpacity = React.useRef(new Animated.Value(0)).current;
  const lastTap = React.useRef(0);
  const [expandedComments, setExpandedComments] = React.useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = React.useState('');
  const [replyingTo, setReplyingTo] = React.useState<{ id: string, username: string } | null>(null);

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    console.log(replyingTo ? `Replying to ${replyingTo.username}:` : 'New comment:', commentText);
    setCommentText('');
    setReplyingTo(null);
  };

  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const triggerHeartAnimation = () => {
    setShowHeartAnimation(true);
    heartScale.setValue(0);
    heartOpacity.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 500,
          delay: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setShowHeartAnimation(false));
  };

  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap
      if (!liked) {
        handleLike();
      }
      triggerHeartAnimation();
    }
    lastTap.current = now;
  };

  const handleShare = async () => {
    try {
      const shareMessage = `¡Mira este increíble avistamiento en Birdify!\n\nSe avistó un ${post.tag} por @${post.username}\n\n${post.image}`;
      
      const result = await Share.share({
        message: shareMessage,
        url: post.image, // For iOS support
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const isLongCaption = post.caption.length > CAPTION_LIMIT;
  const displayedCaption = isLongCaption && !isCaptionExpanded 
    ? post.caption.substring(0, CAPTION_LIMIT) + '...' 
    : post.caption;

  // Swipe to close and entrance logic
  const screenHeight = Dimensions.get('window').height;
  const panY = React.useRef(new Animated.Value(screenHeight)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          Animated.timing(panY, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowComments(false);
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
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

  React.useEffect(() => {
    if (showComments) {
      // Entrance animation
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).start();
    } else {
      // Ensure it starts from bottom when closed
      panY.setValue(screenHeight);
    }
  }, [showComments, screenHeight]);

  const resetModal = () => {
    Animated.timing(panY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowComments(false);
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          <View style={styles.userText}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{post.username}</Text>
              {post.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color="#458eff" style={styles.verifiedIcon} />
              )}
            </View>
            <Text style={styles.location}>{post.location}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Image Content */}
      <TouchableWithoutFeedback onPress={handleImageTap}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: post.image }} style={styles.postImage} />
          <TouchableOpacity 
            style={styles.tagBadge}
            onPress={() => navigation.navigate('MainTabs', { 
              screen: 'Dictionary',
              params: { searchQuery: post.tag }
            })}
          >
            <Ionicons name="information-circle-outline" size={16} color="#5D4037" />
            <Text style={styles.tagText}>{post.tag}</Text>
          </TouchableOpacity>
          
          {/* Animated Heart Overlay */}
          <Animated.View 
            style={[
              styles.heartOverlay, 
              { 
                transform: [{ scale: heartScale }],
                opacity: heartOpacity
              }
            ]}
          >
            <Ionicons name="heart" size={100} color={'#FF5252CC'} />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={26} 
              color={liked ? "#FF5252" : Colors.textPrimary} 
            />
            <Text style={[styles.actionText, liked && { color: "#FF5252" }]}>
              {likesCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowComments(true)}
          >
            <MaterialCommunityIcons 
              name="comment-outline" 
              size={24} 
              color={Colors.textPrimary} 
            />
            <Text style={styles.actionText}>
              {post.comments}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          <Text style={styles.captionUsername}>{post.username} </Text>
          {displayedCaption}
          {isLongCaption && (
            <Text 
              style={styles.seeMore} 
              onPress={() => setIsCaptionExpanded(!isCaptionExpanded)}
            >
              {" "}{isCaptionExpanded ? "ver menos" : "ver más"}
            </Text>
          )}
        </Text>
        <Text style={styles.timeAgo}>{post.timeAgo}</Text>
      </View>

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="none"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={resetModal}
      >
        <View style={styles.modalOverlayContainer}>
          <Animated.View 
            style={[
              styles.modalOverlay, 
              { opacity: backdropOpacity }
            ]} 
          >
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={resetModal} 
              activeOpacity={1} 
            />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.modalContent, 
              { transform: [{ translateY: panY }] }
            ]}
          >
            {/* Draggable Header */}
            <View {...panResponder.panHandlers} style={styles.modalDragArea}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comentarios</Text>
              </View>
            </View>

            <ScrollView 
              style={styles.modalScrollView} 
              showsVerticalScrollIndicator={false}
            >
              {post.commentsList?.slice(0, visibleCommentsCount).map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUsername}>{comment.username}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => setReplyingTo({ id: comment.id, username: comment.username })}
                    style={styles.replyButton}
                  >
                    <Text style={styles.replyButtonText}>Responder</Text>
                  </TouchableOpacity>
                  
                  {comment.replies && comment.replies.length > 0 && (
                    <View style={styles.repliesContainer}>
                      <TouchableOpacity 
                        onPress={() => toggleCommentExpansion(comment.id)}
                        style={styles.viewRepliesButton}
                      >
                        <Text style={styles.viewRepliesText}>
                          {expandedComments[comment.id] 
                            ? 'Ocultar subcomentarios' 
                            : `Ver ${comment.replies.length} subcomentarios`}
                        </Text>
                      </TouchableOpacity>
                      
                      {expandedComments[comment.id] && (
                        <View style={styles.repliesList}>
                          {comment.replies.map((reply) => (
                            <View key={reply.id} style={styles.replyItem}>
                              <Text style={styles.commentUsername}>{reply.username}</Text>
                              <Text style={styles.commentText}>{reply.text}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}

              {post.commentsList && post.commentsList.length > visibleCommentsCount && (
                <TouchableOpacity 
                  style={styles.loadMoreButton}
                  onPress={() => setVisibleCommentsCount(prev => prev + 5)}
                >
                  <Text style={styles.loadMoreText}>Cargar más comentarios</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Input Area */}
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              <View style={styles.modalInputContainer}>
                {replyingTo && (
                  <View style={styles.replyingToBadge}>
                    <Text style={styles.replyingToText}>Respondiendo a @{replyingTo.username}</Text>
                    <TouchableOpacity onPress={() => setReplyingTo(null)}>
                      <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder={replyingTo ? "Escribe una respuesta..." : "Añade un comentario..."}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity 
                    style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                    onPress={handleCommentSubmit}
                    disabled={!commentText.trim()}
                  >
                    <Ionicons 
                      name="send" 
                      size={20} 
                      color={commentText.trim() ? Colors.primary : Colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>

      {/* Options Menu Modal */}
      <Modal
        visible={showOptionsMenu}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowOptionsMenu(false)}>
          <View style={styles.optionsOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.optionsContent}>
                <View style={styles.modalHandle} />
                <View style={styles.optionsList}>
                  <TouchableOpacity style={styles.optionItem}>
                    <Ionicons name="bookmark-outline" size={22} color={Colors.textPrimary} />
                    <Text style={styles.optionText}>Guardar publicación</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.optionItem}>
                    <Ionicons name="link-outline" size={22} color={Colors.textPrimary} />
                    <Text style={styles.optionText}>Copiar enlace</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.optionItem}>
                    <Ionicons name="eye-off-outline" size={22} color={Colors.textPrimary} />
                    <Text style={styles.optionText}>No me interesa</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.optionDivider} />
                  
                  <TouchableOpacity style={styles.optionItem}>
                    <Ionicons name="alert-circle-outline" size={22} color="#FF5252" />
                    <Text style={[styles.optionText, { color: '#FF5252' }]}>Reportar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
