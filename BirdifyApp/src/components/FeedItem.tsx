import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ReactionRepository } from '../repositories/reaction.repository';
import { CommentRepository } from '../repositories/comment.repository';
import { SightingRepository } from '../repositories/sighting.repository';
import { UserBlockRepository } from '../repositories/user_block.repository';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, PanResponder, Animated, Dimensions, TouchableWithoutFeedback, Share, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing, Typography, Radius, Shadows } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createStyles } from '../styles/components/FeedItem.styles';
import { useDynamicStyles } from '../hooks/useDynamicStyles';
import PagerView from 'react-native-pager-view';
import AppToast from './AppToast';

export interface Comment {
  id: string;
  userId?: string;
  username: string;
  text: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  userId?: string;
  username: string;
  userAvatar: string;
  location: string;
  image: string | string[];
  tag: string;
  likes: number;
  comments: number;
  caption: string;
  timeAgo: string;
  isVerified?: boolean;
  commentsList?: Comment[];
  hasLiked?: boolean;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  syncStatus?: 'pending' | 'synced';
}

interface FeedItemProps {
  post: Post;
  onPostDeleted?: () => void;
  onNavigateAway?: () => void;
  isNew?: boolean;
}

const CAPTION_LIMIT = 100;
const INITIAL_COMMENTS_DISPLAY = 5;

function FeedItem({ post, onPostDeleted, onNavigateAway, isNew }: FeedItemProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();

  const [isCaptionExpanded, setIsCaptionExpanded] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = React.useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = React.useState(INITIAL_COMMENTS_DISPLAY);
  const [liked, setLiked] = React.useState(post.hasLiked || false);
  const [likesCount, setLikesCount] = React.useState(post.likes);
  const [commentsCount, setCommentsCount] = React.useState(post.comments);
  const [commentsList, setCommentsList] = React.useState<Comment[]>([]);

  React.useEffect(() => {
    setLiked(post.hasLiked || false);
    setLikesCount(post.likes);
    setCommentsCount(post.comments);
  }, [post.hasLiked, post.likes, post.comments]);
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = React.useState(false);
  const heartScale = React.useRef(new Animated.Value(0)).current;
  const heartOpacity = React.useRef(new Animated.Value(0)).current;
  const lastTap = React.useRef(0);
  const [expandedComments, setExpandedComments] = React.useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = React.useState('');
  const [replyingTo, setReplyingTo] = React.useState<{
    id: string;
    username: string;
    parentId: string | null;
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showBlockModal, setShowBlockModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isBlocking, setIsBlocking] = React.useState(false);
  const [toast, setToast] = React.useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });
const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = React.useCallback((message: string, type: 'success' | 'error') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ visible: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4500);
  }, []);

  React.useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const images = Array.isArray(post.image) ? post.image : [post.image];
  const currentImage = images[currentImageIndex];
  const totalImages = images.length;


  const screenHeight = Dimensions.get('window').height;
  const panY = React.useRef(new Animated.Value(screenHeight)).current;
  const optionsPanY = React.useRef(new Animated.Value(screenHeight)).current;


  const loadComments = React.useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) setLoadingComments(true);
      const data = await CommentRepository.getBySightingId(post.id);
      setCommentsList(data);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      if (showLoadingState) setLoadingComments(false);
    }
  }, [post.id]);

  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    if (Platform.OS !== 'android') return;

    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  React.useEffect(() => {
    return () => {
      heartScale.stopAnimation();
      heartOpacity.stopAnimation();
      panY.stopAnimation();
      optionsPanY.stopAnimation();
    };
  }, []);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (showComments) {
      loadComments();
      // Refrescar silenciosamente los comentarios cada 1 minuto (60,000 ms)
      intervalId = setInterval(() => {
        loadComments(false); // asumiendo que loadComments puede tomar un flag para no mostrar loading, o simplemente llamarlo
      }, 60000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showComments, loadComments]);

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      Alert.alert('Inicia Sesión', 'Debes iniciar sesión para comentar.');
      return;
    }

    try {
      const parentId = replyingTo ? (replyingTo.parentId || replyingTo.id) : null;
      let finalContent = commentText.trim();

      if (replyingTo && replyingTo.parentId && replyingTo.parentId !== replyingTo.id) {
        const mention = `@${replyingTo.username} `;
        if (!finalContent.startsWith(mention)) {
          finalContent = mention + finalContent;
        }
      }

      await CommentRepository.create(post.id, user.id, finalContent, parentId);
      
      // Limpiar input y estado
      setCommentText('');
      setReplyingTo(null);

      // Recargar comentarios y actualizar contador
      await loadComments();
      setCommentsCount(prev => prev + 1);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo publicar tu comentario. Inténtalo de nuevo.');
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Inicia Sesión', 'Debes iniciar sesión para reaccionar a las publicaciones.');
      return;
    }

    const wasLiked = liked;
    // Actualización de UI Optimista
    setLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked) {
        await ReactionRepository.unreact(post.id, user.id);
      } else {
        await ReactionRepository.react(post.id, user.id);
      }
    } catch (error) {
      // Revertir si el servidor de Supabase arroja error
      setLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      Alert.alert('Reacción no registrada', 'Hubo un error de conexión con la base de datos.');
    }
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
      const shareMessage = `¡Mira este increíble avistamiento en Birdify!\n\nSe avistó un ${post.tag} por @${post.username}\n\n${currentImage}`;

      const result = await Share.share({
        message: shareMessage,
        url: currentImage,
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
            resetModal();
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

  const optionsPanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          optionsPanY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          Animated.timing(optionsPanY, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowOptionsMenu(false);
          });
        } else {
          Animated.spring(optionsPanY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8
          }).start();
        }
      },
    })
  ).current;

  const optionsBackdropOpacity = optionsPanY.interpolate({
    inputRange: [0, screenHeight],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  React.useEffect(() => {
    if (showOptionsMenu) {
      Animated.spring(optionsPanY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).start();
    } else {
      optionsPanY.setValue(screenHeight);
    }
  }, [showOptionsMenu, screenHeight]);

  const resetOptionsModal = () => {
    Animated.timing(optionsPanY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowOptionsMenu(false);
    });
  };

  const isOwnPost = user?.id === post.userId;

  const handleEditSighting = () => {
    resetOptionsModal();
    setTimeout(() => {
      navigation.navigate('RecordSighting', { editingSighting: post.id });
    }, 300);
  };

const handleDeleteSighting = async () => {
  const createdAt = new Date(post.createdAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

  if (diffMinutes > 10 && post.syncStatus !== 'pending') {
    resetOptionsModal();
    setTimeout(() => {
      Alert.alert(
        'No se puede eliminar',
        'Solo puedes eliminar avistamientos dentro de los 10 minutos después de publicarlos.'
      );
    }, 350);
    return;
  }

  // Esperar a que el options sheet cierre antes de abrir el delete modal
  resetOptionsModal();
  setTimeout(() => {
    setShowDeleteModal(true);
  }, 350);
};

  const confirmDeleteSighting = async () => {
    setIsDeleting(true);
    try {
      await SightingRepository.delete(post.id);
      setShowDeleteModal(false);
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el avistamiento. Intenta de nuevo.');
      console.error('Error deleting sighting:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBlockUser = async () => {
    if (!user) {
      Alert.alert('Inicia Sesión', 'Debes iniciar sesión para bloquear usuarios.');
      return;
    }

    if (!post.userId) {
      Alert.alert('Error', 'No se puede bloquear este usuario.');
      return;
    }

    if (user.id === post.userId) {
      Alert.alert('Error', 'No puedes bloquearte a ti mismo.');
      return;
    }

    resetOptionsModal();
    setShowBlockModal(true);
  };

  const confirmBlockUser = async () => {
    if (!post.userId || !user) return;

    if (user.id === post.userId) {
      setShowBlockModal(false);
      showToast('No puedes bloquearte a ti mismo.', 'error');
      return;
    }

    setIsBlocking(true);
    try {
      await UserBlockRepository.block(user.id, post.userId);
      setShowBlockModal(false);
      showToast(`Has bloqueado a @${post.username}.`, 'success');
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      showToast('No se pudo bloquear al usuario. Intenta de nuevo.', 'error');
      console.error('Error blocking user:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const pagerRef = React.useRef<PagerView>(null);
  return (
    <View style={[styles.container, isNew && { borderWidth: 2, borderColor: colors.primary }]}>
      {toast.visible && (
        <AppToast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
          topOffset={8}
          containerStyle={{ left: 12, right: 12 }}
        />
      )}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => {
            onNavigateAway?.();
            navigation.navigate('Profile', { userId: post.userId });
          }}
        >
          {!post.syncStatus && (
            <Image source={{ uri: post.userAvatar }} style={styles.avatar} fadeDuration={0} />
          )}
          <View style={styles.userText}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.username} numberOfLines={1}>
                  {post.username}
                </Text>
                {post.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                )}
                {post.syncStatus && (
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2,
                    backgroundColor: post.syncStatus === 'pending' ? '#fef3c7' : '#dcfce7'
                  }}>
                    <Ionicons
                      name={post.syncStatus === 'pending' ? 'cloud-upload-outline' : 'cloud-done-outline'}
                      size={12}
                      color={post.syncStatus === 'pending' ? '#92400e' : '#166534'}
                    />
                    <Text style={{
                      fontSize: 10, fontFamily: 'PlusJakartaSans-SemiBold',
                      color: post.syncStatus === 'pending' ? '#92400e' : '#166534'
                    }}>
                      {post.syncStatus === 'pending' ? 'Pendiente' : 'Sincronizado'}
                    </Text>
                  </View>
                )}
              </View>
            <TouchableOpacity onPress={() => {
              if (post.latitude && post.longitude) {
                const targetSighting = {
                  id: post.id,
                  latitude: post.latitude,
                  longitude: post.longitude,
                };
                // Si Explore está en el navigator actual (tab), navegar directamente.
                // Si no (ej. desde modal de Profile en stack), navegar a MainTabs -> Explore.
                if (navigation.getState().routeNames.includes('Explore')) {
                  navigation.navigate('Explore', { targetSighting });
                } else {
                  (navigation as any).navigate('MainTabs', { screen: 'Explore', params: { targetSighting } });
                }
              }
            }}>
              <Text style={styles.location}>{post.location}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {totalImages > 1 && (
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1} / {totalImages}
          </Text>
        </View>
      )}
      

      {/* Image Content */}
      <PagerView
        ref={pagerRef}
        style={styles.imageContainer}
        initialPage={0}
        scrollEnabled={true}
        offscreenPageLimit={1}
        overdrag={false}
        onPageSelected={(e) => setCurrentImageIndex(e.nativeEvent.position)}
      >
        {images.map((img, index) => (
          <View key={index} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={handleImageTap}>
              <Image source={{ uri: img }} style={styles.postImage} fadeDuration={0} resizeMode="cover" />
            </TouchableWithoutFeedback>
          </View>
        ))}
      </PagerView>
      {/* Dots indicator */}
        {totalImages > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.activeDot
                ]}
              />
            ))}
          </View>
        )}

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
              color={liked ? "#FF5252" : Colors.primary} 
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
              color={Colors.primary} 
            />
            <Text style={styles.actionText}>
              {commentsCount}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={Colors.primary} />
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
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
              {loadingComments ? (
                <View style={{ paddingVertical: 40, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={{ marginTop: 10, color: Colors.textSecondary, fontSize: 13 }}>Cargando comentarios...</Text>
                </View>
              ) : commentsList.length === 0 ? (
                <View style={{ paddingVertical: 40, justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="chatbubbles-outline" size={32} color={colors.primary + '80'} />
                  <Text style={{ marginTop: 10, color: Colors.textSecondary, fontSize: 14, textAlign: 'center' }}>
                    Aún no hay comentarios.{"\n"}¡Sé el primero en compartir tu opinión!
                  </Text>
                </View>
              ) : (
                commentsList.slice(0, visibleCommentsCount).map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <TouchableOpacity onPress={() => {
                        if (comment.userId) {
                          setShowComments(false);
                          onNavigateAway?.();
                          navigation.navigate('Profile', { userId: comment.userId });
                        }
                      }}>
                        <Text style={styles.commentUsername}>{comment.username}</Text>
                      </TouchableOpacity>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => setReplyingTo({ id: comment.id, username: comment.username, parentId: null })}
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
                              <View key={reply.id} style={{ marginBottom: Spacing.sm }}>
                                <View style={styles.replyItem}>
                                  <TouchableOpacity onPress={() => {
                                    if (reply.userId) {
                                      setShowComments(false);
                                      onNavigateAway?.();
                                      navigation.navigate('Profile', { userId: reply.userId });
                                    }
                                  }}>
                                    <Text style={styles.commentUsername}>{reply.username}</Text>
                                  </TouchableOpacity>
                                  <Text style={styles.commentText}>{reply.text}</Text>
                                </View>
                                <TouchableOpacity 
                                  onPress={() => setReplyingTo({ id: reply.id, username: reply.username, parentId: comment.id })}
                                  style={styles.replyButton}
                                >
                                  <Text style={styles.replyButtonText}>Responder</Text>
                                </TouchableOpacity>
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
                  onPress={() => setVisibleCommentsCount(prev => prev + 5)}
                >
                  <Text style={styles.loadMoreText}>Cargar más comentarios</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Input Area */}
            <View style={[
              styles.modalInputContainer,
              Platform.OS === 'android' && keyboardHeight > 0 && { paddingBottom: keyboardHeight }
            ]}>
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
        animationType="none"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={resetOptionsModal}
      >
        <View style={styles.optionsOverlay}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#000', opacity: optionsBackdropOpacity }
            ]}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={resetOptionsModal}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.optionsContent,
              { transform: [{ translateY: optionsPanY }] }
            ]}
          >
            <View {...optionsPanResponder.panHandlers} style={{ width: '100%', alignItems: 'center', paddingVertical: 10 }}>
              <View style={styles.modalHandle} />
            </View>

            <View style={styles.optionsList}>
              {isOwnPost && (
                <>
                  <TouchableOpacity style={styles.optionItem} onPress={handleEditSighting}>
                    <Ionicons name="pencil-outline" size={22} color={Colors.textPrimary} />
                    <Text style={styles.optionText}>Editar publicación</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.optionItem} onPress={handleDeleteSighting}>
                    <Ionicons name="trash-outline" size={22} color="#FF5252" />
                    <Text style={[styles.optionText, { color: '#FF5252' }]}>Eliminar avistamiento</Text>
                  </TouchableOpacity>
                  <View style={styles.optionDivider} />
                </>
              )}

              {!isOwnPost && (
                <>
                  <TouchableOpacity style={styles.optionItem} onPress={handleBlockUser}>
                    <Ionicons name="ban-outline" size={22} color="#FF5252" />
                    <Text style={[styles.optionText, { color: '#FF5252' }]}>Bloquear usuario</Text>
                  </TouchableOpacity>
                  <View style={styles.optionDivider} />
                </>
              )}

              <TouchableOpacity style={styles.optionItem} onPress={resetOptionsModal}>
                <Ionicons name="close-outline" size={22} color={Colors.textPrimary} />
                <Text style={styles.optionText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <View style={[styles.optionsOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#000', opacity: 0.5 }
            ]}
          />

          <View style={{
            backgroundColor: colors.canvasPure,
            borderRadius: 20,
            padding: Spacing.lg,
            width: '80%',
            ...Shadows.modal
          }}>
            <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FF5252',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Spacing.md
              }}>
                <Ionicons name="trash-bin-outline" size={40} color={colors.canvasPure} />
              </View>

              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: colors.textPrimary,
                textAlign: 'center',
                fontFamily: Typography.fontFamilyDisplay,
                marginBottom: Spacing.sm
              }}>
                Eliminar avistamiento
              </Text>

              <Text style={{
                fontSize: Typography.fontSize.md,
                color: colors.textSecondary,
                textAlign: 'center',
                fontFamily: Typography.fontFamilyBody,
                lineHeight: Typography.lineHeight.normal
              }}>
                ¿Estás seguro de que deseas eliminar este avistamiento? Esta acción no se puede deshacer.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg }}>
              <TouchableOpacity
                disabled={isDeleting}
                onPress={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: Spacing.md,
                  borderRadius: Radius.md,
                  backgroundColor: colors.componentBase,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.md,
                  fontWeight: Typography.fontWeight.semiBold,
                  color: colors.textPrimary,
                  fontFamily: Typography.fontFamilyDisplay
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isDeleting}
                onPress={confirmDeleteSighting}
                style={{
                  flex: 1,
                  paddingVertical: Spacing.md,
                  borderRadius: Radius.md,
                  backgroundColor: '#FF5252',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.canvasPure} />
                ) : (
                  <Text style={{
                    fontSize: Typography.fontSize.md,
                    fontWeight: Typography.fontWeight.semiBold,
                    color: colors.canvasPure,
                    fontFamily: Typography.fontFamilyDisplay
                  }}>
                    Eliminar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Block User Confirmation Modal */}
      <Modal
        visible={showBlockModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => !isBlocking && setShowBlockModal(false)}
      >
        <View style={[styles.optionsOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#000', opacity: 0.5 }
            ]}
          />

          <View style={{
            backgroundColor: colors.canvasPure,
            borderRadius: 20,
            padding: Spacing.lg,
            width: '80%',
            ...Shadows.modal
          }}>
            <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FF5252',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Spacing.md
              }}>
                <Ionicons name="ban-outline" size={40} color={colors.canvasPure} />
              </View>

              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: colors.textPrimary,
                textAlign: 'center',
                fontFamily: Typography.fontFamilyDisplay,
                marginBottom: Spacing.sm
              }}>
                Bloquear a @{post.username}
              </Text>

              <Text style={{
                fontSize: Typography.fontSize.md,
                color: colors.textSecondary,
                textAlign: 'center',
                fontFamily: Typography.fontFamilyBody,
                lineHeight: Typography.lineHeight.normal,
                marginBottom: Spacing.sm
              }}>
                No podrán ver tu perfil ni tu actividad. Puedes desbloquearlos en tu configuración.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg }}>
              <TouchableOpacity
                disabled={isBlocking}
                onPress={() => setShowBlockModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: Spacing.md,
                  borderRadius: Radius.md,
                  backgroundColor: colors.componentBase,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.md,
                  fontWeight: Typography.fontWeight.semiBold,
                  color: colors.textPrimary,
                  fontFamily: Typography.fontFamilyDisplay
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isBlocking}
                onPress={confirmBlockUser}
                style={{
                  flex: 1,
                  paddingVertical: Spacing.md,
                  borderRadius: Radius.md,
                  backgroundColor: '#FF5252',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: isBlocking ? 0.7 : 1
                }}
              >
                {isBlocking ? (
                  <ActivityIndicator size="small" color={colors.canvasPure} />
                ) : (
                  <Text style={{
                    fontSize: Typography.fontSize.md,
                    fontWeight: Typography.fontWeight.semiBold,
                    color: colors.canvasPure,
                    fontFamily: Typography.fontFamilyDisplay
                  }}>
                    Bloquear
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default React.memo(FeedItem);
