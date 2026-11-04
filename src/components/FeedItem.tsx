import React, { useCallback } from 'react';
import { View, Share, Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { ReactionRepository } from '../repositories/reaction.repository';
import { CommentRepository } from '../repositories/comment.repository';
import { SightingRepository } from '../repositories/sighting.repository';
import { UserBlockRepository } from '../repositories/user_block.repository';
import { createStyles } from '../styles/components/FeedItem.styles';
import { useDynamicStyles } from '../hooks/useDynamicStyles';
import AppToast from './AppToast';
import ReportModal from './ReportModal';
import { useT, formatTimeAgo } from '../i18n';
import { haptics } from '../utils/haptics';
import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import PagerView from 'react-native-pager-view';

import { FeedCardHeader } from './feed/FeedCardHeader';
import { FeedCardMedia } from './feed/FeedCardMedia';
import { FeedCardActions } from './feed/FeedCardActions';
import { FeedCardCaption } from './feed/FeedCardCaption';
import { FeedCommentsModal } from './feed/FeedCommentsModal';
import { FeedOptionsMenuModal } from './feed/FeedOptionsMenuModal';
import { FeedDeleteConfirmModal } from './feed/FeedDeleteConfirmModal';
import { FeedBlockConfirmModal } from './feed/FeedBlockConfirmModal';

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
  onLikeToggled?: (postId: string, hasLiked: boolean, newCount: number) => void;
  onCommentAdded?: (postId: string, newCount: number) => void;
  isNew?: boolean;
}

const INITIAL_COMMENTS_DISPLAY = 5;
const DOUBLE_TAP_DELAY = 380;

function FeedItem({
  post,
  onPostDeleted,
  onNavigateAway,
  onLikeToggled,
  onCommentAdded,
  isNew,
}: FeedItemProps) {
  const isOffline = useOffline();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();
  const { t } = useT();
  const displayTime = post.createdAt ? formatTimeAgo(post.createdAt) : post.timeAgo;

  const [showComments, setShowComments] = React.useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = React.useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = React.useState(INITIAL_COMMENTS_DISPLAY);
  const [liked, setLiked] = React.useState(post.hasLiked || false);
  const [likesCount, setLikesCount] = React.useState(post.likes);
  const [commentsCount, setCommentsCount] = React.useState(post.comments);
  const [commentsList, setCommentsList] = React.useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = React.useState(false);

  React.useEffect(() => {
    setLiked(post.hasLiked || false);
    setLikesCount(post.likes);
    setCommentsCount(post.comments);
  }, [post.hasLiked, post.likes, post.comments]);

  // Double tap heart animation
  const [showHeartAnimation, setShowHeartAnimation] = React.useState(false);
  const heartScale = React.useRef(new Animated.Value(0)).current;
  const heartOpacity = React.useRef(new Animated.Value(0)).current;
  const heartTranslateY = React.useRef(new Animated.Value(0)).current;
  const heartAnimationRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const lastTap = React.useRef(0);

  // Comments state
  const [expandedComments, setExpandedComments] = React.useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = React.useState('');
  const [replyingTo, setReplyingTo] = React.useState<{
    id: string;
    username: string;
    parentId: string | null;
  } | null>(null);

  // Carousel & Image state
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [imageLoaded, setImageLoaded] = React.useState<Record<number, boolean>>({});
  const [imageError, setImageError] = React.useState<Record<number, boolean>>({});
  const pagerRef = React.useRef<PagerView>(null);

  const scrollProgress = useSharedValue(0);
  const counterOpacity = useSharedValue(1);
  const hideCounterTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerCounterVisibility = React.useCallback(() => {
    counterOpacity.value = withTiming(1, { duration: 150 });
    if (hideCounterTimeout.current) {
      clearTimeout(hideCounterTimeout.current);
    }
    hideCounterTimeout.current = setTimeout(() => {
      counterOpacity.value = withTiming(0, { duration: 350 });
    }, 2200);
  }, [counterOpacity]);

  React.useEffect(() => {
    triggerCounterVisibility();
    return () => {
      if (hideCounterTimeout.current) clearTimeout(hideCounterTimeout.current);
    };
  }, [triggerCounterVisibility]);

  const counterAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: counterOpacity.value,
      transform: [
        {
          scale: interpolate(
            counterOpacity.value,
            [0, 1],
            [0.9, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  React.useEffect(() => {
    setImageLoaded({});
    setImageError({});
  }, [post.image]);

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showBlockModal, setShowBlockModal] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isBlocking, setIsBlocking] = React.useState(false);

  // Toast state
  const [toast, setToast] = React.useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
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
      setToast((prev) => ({ ...prev, visible: false }));
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

  React.useEffect(() => {
    return () => {
      heartScale.stopAnimation();
      heartOpacity.stopAnimation();
      heartTranslateY.stopAnimation();
    };
  }, [heartScale, heartOpacity, heartTranslateY]);

  React.useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout>;
    if (showComments) {
      loadComments();
      intervalId = setInterval(() => {
        loadComments(false);
      }, 60000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showComments, loadComments]);

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      Alert.alert('Inicia Sesión', 'Debes iniciar sesión para comentar.');
      return;
    }

    if (isOffline && post.syncStatus !== 'pending') {
      showToast('No puedes interactuar con esta publicación sin conexión.', 'error');
      return;
    }

    try {
      const parentId = replyingTo ? replyingTo.parentId || replyingTo.id : null;
      let finalContent = commentText.trim();

      if (replyingTo && replyingTo.parentId && replyingTo.parentId !== replyingTo.id) {
        const mention = `@${replyingTo.username} `;
        if (!finalContent.startsWith(mention)) {
          finalContent = mention + finalContent;
        }
      }

      await CommentRepository.create(post.id, user.id, finalContent, parentId);
      setCommentText('');
      setReplyingTo(null);
      await loadComments();
      const updatedCount = commentsCount + 1;
      setCommentsCount(updatedCount);
      onCommentAdded?.(post.id, updatedCount);
    } catch (error) {
      Alert.alert('Error', 'No se pudo publicar tu comentario. Inténtalo de nuevo.');
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Inicia Sesión', 'Debes iniciar sesión para reaccionar a las publicaciones.');
      return;
    }

    if (isOffline && post.syncStatus !== 'pending') {
      showToast('No puedes interactuar con esta publicación sin conexión.', 'error');
      return;
    }

    const wasLiked = liked;
    const newLiked = !wasLiked;
    const newLikesCount = wasLiked ? likesCount - 1 : likesCount + 1;
    setLiked(newLiked);
    setLikesCount(newLikesCount);
    onLikeToggled?.(post.id, newLiked, newLikesCount);

    try {
      if (wasLiked) {
        await ReactionRepository.unreact(post.id, user.id);
      } else {
        await ReactionRepository.react(post.id, user.id);
      }
    } catch (error) {
      setLiked(wasLiked);
      setLikesCount(likesCount);
      onLikeToggled?.(post.id, wasLiked, likesCount);
      Alert.alert('Reacción no registrada', 'Hubo un error de conexión con la base de datos.');
    }
  };

  const triggerHeartAnimation = () => {
    if (heartAnimationRef.current) {
      heartAnimationRef.current.stop();
    }

    setShowHeartAnimation(true);
    heartScale.setValue(0);
    heartOpacity.setValue(0);
    heartTranslateY.setValue(0);

    const anim = Animated.parallel([
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1.25,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(220),
        Animated.timing(heartScale, {
          toValue: 1.35,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.delay(320),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(240),
        Animated.timing(heartTranslateY, {
          toValue: -24,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]);

    heartAnimationRef.current = anim;
    anim.start(({ finished }) => {
      if (finished) {
        setShowHeartAnimation(false);
      }
    });
  };

  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      if (!liked) {
        handleLike();
      }
      haptics.medium();
      triggerHeartAnimation();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      triggerCounterVisibility();
    }
  };

  const handleShare = async () => {
    try {
      const shareMessage = `¡Mira este increíble avistamiento en Birdify!\n\nSe avistó un ${post.tag} por @${post.username}\n\n${currentImage}`;
      await Share.share({
        message: shareMessage,
        url: currentImage,
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const isOwnPost = user?.id === post.userId;

  const handleEditSighting = () => {
    setShowOptionsMenu(false);
    onNavigateAway?.();
    setTimeout(() => {
      navigation.navigate('RecordSighting', { editingSighting: post.id });
    }, 300);
  };

  const handleDeleteSighting = () => {
    const createdAt = new Date(post.createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (diffMinutes > 10 && post.syncStatus !== 'pending') {
      setShowOptionsMenu(false);
      setTimeout(() => {
        showToast(t('feed.deleteTimeLimit'), 'error');
      }, 350);
      return;
    }

    setShowOptionsMenu(false);
    setTimeout(() => {
      setShowDeleteModal(true);
    }, 350);
  };

  const confirmDeleteSighting = async () => {
    setIsDeleting(true);
    try {
      await SightingRepository.delete(post.id);
      setShowDeleteModal(false);
      onNavigateAway?.();
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('feed.deleteFailed'));
      console.error('Error deleting sighting:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBlockUser = () => {
    if (!user) {
      Alert.alert(t('auth.login'), t('feed.mustLoginToBlock'));
      return;
    }

    if (!post.userId) {
      Alert.alert(t('common.error'), t('feed.cannotBlockUser'));
      return;
    }

    if (user.id === post.userId) {
      Alert.alert(t('common.error'), t('feed.cannotBlockSelf'));
      return;
    }

    setShowOptionsMenu(false);
    setShowBlockModal(true);
  };

  const confirmBlockUser = async () => {
    if (!post.userId || !user) return;

    if (user.id === post.userId) {
      setShowBlockModal(false);
      showToast(t('feed.cannotBlockSelf'), 'error');
      return;
    }

    setIsBlocking(true);
    try {
      await UserBlockRepository.block(user.id, post.userId);
      setShowBlockModal(false);
      showToast(t('feed.blockSuccess', { username: post.username }), 'success');
      onNavigateAway?.();
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      showToast(t('feed.blockFailed'), 'error');
      console.error('Error blocking user:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleTagPress = useCallback(() => {
    if (post.tag) {
      onNavigateAway?.();
      navigation.navigate('MainTabs', {
        screen: 'Dictionary',
        params: { searchQuery: post.tag },
      });
    }
  }, [navigation, onNavigateAway, post.tag]);

  return (
    <View style={[styles.container, isNew && { borderWidth: 2, borderColor: colors.primary }]}>
      {toast.visible && (
        <AppToast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
          topOffset={8}
          containerStyle={{ left: 12, right: 12 }}
        />
      )}

      {/* 1. Header */}
      <FeedCardHeader
        post={post}
        styles={styles}
        navigation={navigation}
        onNavigateAway={onNavigateAway}
        onOptionsPress={() => setShowOptionsMenu(true)}
      />

      {/* 2. Media Carousel */}
      <FeedCardMedia
        images={images}
        postTag={post.tag}
        pagerRef={pagerRef}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
        imageLoaded={imageLoaded}
        setImageLoaded={setImageLoaded}
        imageError={imageError}
        setImageError={setImageError}
        scrollProgress={scrollProgress}
        counterAnimatedStyle={counterAnimatedStyle}
        triggerCounterVisibility={triggerCounterVisibility}
        showHeartAnimation={showHeartAnimation}
        heartScale={heartScale}
        heartOpacity={heartOpacity}
        heartTranslateY={heartTranslateY}
        onImageTap={handleImageTap}
        onTagPress={handleTagPress}
        styles={styles}
        colors={colors}
        isDark={isDark}
      />

      {/* 3. Actions */}
      <FeedCardActions
        liked={liked}
        likesCount={likesCount}
        commentsCount={commentsCount}
        onLikePress={handleLike}
        onCommentPress={() => {
          setShowComments(true);
          loadComments();
        }}
        onSharePress={handleShare}
        styles={styles}
      />

      {/* 4. Caption */}
      <FeedCardCaption
        username={post.username}
        caption={post.caption}
        displayTime={displayTime}
        styles={styles}
      />

      {/* 5. Comments Modal */}
      <FeedCommentsModal
        visible={showComments}
        onClose={() => {
          setShowComments(false);
          setCommentsList([]);
        }}
        commentsList={commentsList}
        loadingComments={loadingComments}
        visibleCommentsCount={visibleCommentsCount}
        setVisibleCommentsCount={setVisibleCommentsCount}
        expandedComments={expandedComments}
        toggleCommentExpansion={toggleCommentExpansion}
        commentText={commentText}
        setCommentText={setCommentText}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        onCommentSubmit={handleCommentSubmit}
        isOffline={isOffline}
        postSyncStatus={post.syncStatus}
        navigation={navigation}
        onNavigateAway={onNavigateAway}
        styles={styles}
        colors={colors}
      />

      {/* 6. Options Menu Modal */}
      <FeedOptionsMenuModal
        visible={showOptionsMenu}
        isOwnPost={isOwnPost}
        onClose={() => setShowOptionsMenu(false)}
        onEdit={handleEditSighting}
        onDelete={handleDeleteSighting}
        onReport={() => {
          setShowOptionsMenu(false);
          setShowReportModal(true);
        }}
        onBlock={handleBlockUser}
        styles={styles}
      />

      {/* 7. Delete Confirmation Modal */}
      <FeedDeleteConfirmModal
        visible={showDeleteModal}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteSighting}
        styles={styles}
        colors={colors}
      />

      {/* 8. Report Modal */}
      {user?.id && (
        <ReportModal
          visible={showReportModal}
          reporterId={user.id}
          sightingId={post.id}
          reportedUserId={post.userId || null}
          targetLabel={`@${post.username}`}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => showToast(t('feed.reportSent'), 'success')}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* 9. Block Confirmation Modal */}
      <FeedBlockConfirmModal
        visible={showBlockModal}
        isBlocking={isBlocking}
        username={post.username}
        onClose={() => setShowBlockModal(false)}
        onConfirm={confirmBlockUser}
        styles={styles}
        colors={colors}
      />
    </View>
  );
}

export default React.memo(FeedItem);
