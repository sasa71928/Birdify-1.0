import React, { useState } from 'react';
import {
  View,
  StatusBar,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { handleError, showSuccess } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import ReportModal from '../../components/ReportModal';
import { ProfileSkeleton } from '../../components/skeleton';
import FeedItem from '../../components/FeedItem';
import {
  useProfileData,
  ProfileHero,
  ProfileStats,
  ProfileTabs,
  ProfileTabType,
  ProfileTopBar,
  SightingsGrid,
  LogbookView,
  LikesView,
  FollowListSheet,
  PrivateProfileState,
  mapSightingToPost,
} from '../../features/profile';

type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProfileRouteProp>();
  const { colors, isDark } = useDynamicStyles();
  const { user: authUser } = useAuth();
  const { t } = useT();
  const insets = useSafeAreaInsets();

  const userId = route.params?.userId;

  const {
    isMe,
    displayUserId,
    profile,
    loadingProfile,
    sightings,
    likes,
    species,
    followersCount,
    followingCount,
    isFollowingUser,
    canViewPrivateContent,
    togglingFollow,
    togglingModalUserId,
    modalUsersList,
    loadingModalUsers,
    followModalVisible,
    setFollowModalVisible,
    followModalType,
    toast,
    setToast,
    handleFollowToggle,
    openFollowModal,
    handleModalFollowToggle,
    handlePostDeleted,
  } = useProfileData(authUser, userId);

  const [activeTab, setActiveTab] = useState<ProfileTabType>('Sightings');
  const [selectedSighting, setSelectedSighting] = useState<any>(null);
  const [showSightingModal, setShowSightingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Scroll tracking for parallax and compact header
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleSightingPress = (item: any) => {
    setSelectedSighting(item);
    setShowSightingModal(true);
  };

  const handleLikeToggled = (postId: string, hasLiked: boolean) => {
    if (!authUser?.id) return;
    setSelectedSighting((prev: any) => {
      if (!prev || prev.id !== postId) return prev;
      const currentReactions = prev.reactions || [];
      const updatedReactions = hasLiked
        ? currentReactions.some((r: any) => r.user_id === authUser.id)
          ? currentReactions
          : [...currentReactions, { user_id: authUser.id }]
        : currentReactions.filter((r: any) => r.user_id !== authUser.id);
      return { ...prev, reactions: updatedReactions };
    });
  };

  const handleCommentAdded = (postId: string) => {
    setSelectedSighting((prev: any) => {
      if (!prev || prev.id !== postId) return prev;
      const currentComments = prev.comments || [];
      return { ...prev, comments: [...currentComments, { id: Date.now().toString() }] };
    });
  };

  const handleStartConversation = async () => {
    if (!authUser?.id || !displayUserId) return;
    try {
      const conversationId = await ConversationRepository.createDirectConversation(
        authUser.id,
        displayUserId
      );
      navigation.navigate('Chat', { conversationId });
    } catch (error) {
      handleError(error, setToast, t('profile.createChatFailed'));
    }
  };

  if (loadingProfile) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.surface }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ProfileTopBar profile={profile} isMe={isMe} />
        <ProfileSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: colors.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Docked top bar respecting safe area */}
      <ProfileTopBar profile={profile} isMe={isMe} />

      {/* Scrollable Body */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={canViewPrivateContent ? [2] : undefined}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Child 0: Profile Hero banner, avatar, info & action buttons */}
        <ProfileHero
          profile={profile}
          isMe={isMe}
          isFollowingUser={isFollowingUser}
          togglingFollow={togglingFollow}
          onFollowToggle={handleFollowToggle}
          onMessagePress={handleStartConversation}
          onReportPress={() => setShowReportModal(true)}
          scrollY={scrollY}
        />

        {/* Child 1: Stats Row */}
        <ProfileStats
          followersCount={followersCount}
          followingCount={followingCount}
          speciesCount={species.length}
          sightingsCount={sightings.length}
          onFollowersPress={() => openFollowModal('Followers')}
          onFollowingPress={() => openFollowModal('Following')}
          onSpeciesPress={() => {
            if (canViewPrivateContent) setActiveTab('Logbook');
          }}
          onSightingsPress={() => {
            if (canViewPrivateContent) setActiveTab('Sightings');
          }}
        />

        {/* Child 2: Docked Tabs Header or Private Shield */}
        {!canViewPrivateContent ? (
          <PrivateProfileState />
        ) : (
          <View style={[styles.stickyTabsContainer, { backgroundColor: colors.surface }]}>
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              sightingsCount={sightings.length}
              speciesCount={species.length}
              likesCount={likes.length}
            />
          </View>
        )}

        {/* Child 3: Tab Content */}
        {canViewPrivateContent && (
          <View style={styles.tabContentContainer}>
            {activeTab === 'Sightings' && (
              <SightingsGrid
                sightings={sightings}
                isMe={isMe}
                onItemPress={handleSightingPress}
              />
            )}

            {activeTab === 'Logbook' && <LogbookView species={species} />}

            {activeTab === 'Likes' && (
              <LikesView
                likes={likes}
                isMe={isMe}
                onItemPress={handleSightingPress}
              />
            )}
          </View>
        )}
      </Animated.ScrollView>

      {/* Followers / Following Sheet */}
      <FollowListSheet
        visible={followModalVisible}
        onClose={() => setFollowModalVisible(false)}
        title={
          followModalType === 'Followers'
            ? t('profile.followers')
            : t('profile.following')
        }
        users={modalUsersList}
        loading={loadingModalUsers}
        currentUserId={authUser?.id}
        togglingUserId={togglingModalUserId}
        onFollowToggle={handleModalFollowToggle}
      />

      {/* Report Modal */}
      {authUser?.id && !isMe && displayUserId && (
        <ReportModal
          visible={showReportModal}
          reporterId={authUser.id}
          reportedUserId={displayUserId}
          targetLabel={`@${profile?.username || 'user'}`}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false);
            showSuccess(t('profile.reportSentSuccess'), setToast);
          }}
          onError={(msg) => handleError(msg, setToast)}
        />
      )}

      {/* Sighting Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSightingModal}
        onRequestClose={() => setShowSightingModal(false)}
        statusBarTranslucent
      >
        <View style={styles.sightingModalOverlay}>
          {/* Backdrop que cierra al tocar fuera de la tarjeta */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowSightingModal(false)}
          />

          <ScrollView
            contentContainerStyle={[
              styles.sightingModalScroll,
              {
                paddingTop: Math.max(insets.top + 50, 60),
                paddingBottom: Math.max(insets.bottom + 24, 40),
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sightingCardWrap}>
              {selectedSighting && (
                <FeedItem
                  post={mapSightingToPost(selectedSighting, authUser?.id)}
                  onPostDeleted={() => {
                    handlePostDeleted();
                    setShowSightingModal(false);
                  }}
                  onNavigateAway={() => setShowSightingModal(false)}
                  onLikeToggled={handleLikeToggled}
                  onCommentAdded={handleCommentAdded}
                />
              )}
            </View>
          </ScrollView>

          {/* Botón para cerrar modal */}
          <TouchableOpacity
            style={[
              styles.closeModalBtn,
              { top: Math.max(insets.top + 8, 20) },
            ]}
            onPress={() => setShowSightingModal(false)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={t('common.close') || 'Cerrar'}
          >
            <Ionicons name="close-circle" size={36} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stickyTabsContainer: {
    width: '100%',
    zIndex: 10,
  },
  tabContentContainer: {
    minHeight: 300,
  },
  sightingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  sightingModalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sightingCardWrap: {
    width: '100%',
  },
  closeModalBtn: {
    position: 'absolute',
    right: 18,
    zIndex: 20,
  },
});
