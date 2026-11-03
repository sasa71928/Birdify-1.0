import React, { useState, useContext, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Modal,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import TopNavBar from '../../components/TopNavBar';
import { ChatThread } from '../../navigation/AppNavigator';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../context/AuthContext';
import { OfflineContext } from '../../context/OfflineContext';
import { FollowRepository } from '../../repositories/follow.repository';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { MessagesSkeleton } from '../../components/skeleton';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import { Avatar } from '../../components/ui/Avatar';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Typography, Radius, Spacing, Shadows } from '../../theme';
import { useT } from '../../i18n';
import { formatThreadTime } from '../../features/chat/utils/formatters';

export default function MessagesScreen() {
  const { shared, colors, isDark } = useDynamicStyles();
  const insets = useSafeAreaInsets();
  const isOffline = useContext(OfflineContext);
  const { user } = useAuth();
  const { t, locale } = useT();

  const {
    loading,
    threads,
    deleteModalVisible,
    optionsVisible,
    selectedConversation,
    showLeaveModal,
    leaving,
    toast,
    navigation,
    setDeleteModalVisible,
    setOptionsVisible,
    setShowLeaveModal,
    setToast,
    confirmDelete,
    handleLongPress,
    handleOptionPress,
    handleLeaveGroup,
  } = useMessages();

  // Modal nueva conversación
  const [newChatModalVisible, setNewChatModalVisible] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  const fabScale = useRef(new Animated.Value(1)).current;

  const labels = useMemo(
    () => ({
      today: t('common.today'),
      yesterday: t('common.yesterday'),
    }),
    [t]
  );

  const loadFollowingUsers = useCallback(async () => {
    if (!user) return;
    setLoadingUsers(true);
    try {
      const following = await FollowRepository.getFollowing(user.id);
      setFollowingUsers(following || []);
      setFilteredUsers(following || []);
    } catch (e) {
      handleError(e, setToast, 'No se pudo cargar la lista de contactos');
    } finally {
      setLoadingUsers(false);
    }
  }, [user, setToast]);

  const handleOpenNewChat = () => {
    setSearchQuery('');
    setNewChatModalVisible(true);
    loadFollowingUsers();
  };

  const handleSearch = (queryText: string) => {
    setSearchQuery(queryText);
    if (!queryText.trim()) {
      setFilteredUsers(followingUsers);
      return;
    }
    const lower = queryText.toLowerCase();
    setFilteredUsers(
      followingUsers.filter(
        (u) =>
          u.username?.toLowerCase().includes(lower) ||
          u.fullname?.toLowerCase().includes(lower)
      )
    );
  };

  const handleSelectUser = async (selectedUser: any) => {
    if (!user || startingChat) return;
    setStartingChat(selectedUser.id);
    try {
      const conversationId = await ConversationRepository.createDirectConversation(
        user.id,
        selectedUser.id
      );
      setNewChatModalVisible(false);
      navigation.navigate('Chat', { conversationId });
    } catch (e) {
      handleError(e, setToast, 'No se pudo abrir el chat');
    } finally {
      setStartingChat(null);
    }
  };

  const animateFab = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  if (isOffline) {
    return (
      <SafeAreaView style={[shared.safe, { backgroundColor: colors.surface }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <TopNavBar />
        <View style={styles.centerContainer}>
          <Ionicons name="chatbubble-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.offlineText, { color: colors.textSecondary }]}>
            {t('messages.offlineNotice')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderThread = ({ item }: { item: ChatThread }) => {
    const hasUnread = (item.unreadCount || 0) > 0;
    const timeDisplay = formatThreadTime(item.time, locale, labels) || item.time;

    return (
      <TouchableOpacity
        style={[
          styles.threadItem,
          {
            backgroundColor: hasUnread ? colors.componentBase : colors.surface,
            borderBottomColor: colors.border + '15',
          },
        ]}
        activeOpacity={0.72}
        onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
        onLongPress={() => handleLongPress(item)}
      >
        <Avatar
          uri={item.avatar}
          name={item.name}
          size={50}
          isGroup={item.isGroup}
          isOnline={item.isOnline}
        />

        <View style={styles.threadInfo}>
          <View style={styles.threadHeader}>
            <Text
              style={[
                styles.threadName,
                {
                  color: colors.textPrimary,
                  fontWeight: hasUnread ? '700' : '600',
                  fontFamily: Typography.fontFamilyDisplay,
                },
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.threadTime,
                {
                  color: hasUnread ? colors.primary : colors.textSecondary,
                  fontWeight: hasUnread ? '600' : '400',
                },
              ]}
            >
              {timeDisplay}
            </Text>
          </View>

          <View style={styles.threadFooter}>
            <Text
              style={[
                styles.lastMessageText,
                {
                  color: hasUnread ? colors.textPrimary : colors.textSecondary,
                  fontWeight: hasUnread ? '500' : '400',
                  fontFamily: Typography.fontFamilyBody,
                },
              ]}
              numberOfLines={1}
            >
              {item.lastMessage || ''}
            </Text>

            {hasUnread && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount! > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[shared.safe, { backgroundColor: colors.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TopNavBar />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <View style={styles.container}>
        {/* Header con botón para Nuevo Grupo */}
        <View style={styles.screenHeader}>
          <Text
            style={[
              styles.screenTitle,
              { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
            ]}
          >
            {t('messages.title')}
          </Text>
          <TouchableOpacity
            style={[styles.createGroupBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <MaterialCommunityIcons
              name="account-multiple-plus-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.createGroupText}>{t('messages.newGroup')}</Text>
          </TouchableOpacity>
        </View>

        {/* Barra de búsqueda interactiva */}
        <TouchableOpacity
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.componentBase,
              borderColor: colors.border + '30',
            },
          ]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SearchMessages')}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <Text style={[styles.searchPlaceholder, { color: colors.placeholder }]}>
            {t('messages.searchPlaceholder')}
          </Text>
        </TouchableOpacity>

        {/* Lista de hilos */}
        {loading && threads.length === 0 ? (
          <MessagesSkeleton />
        ) : threads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={56} color={colors.textSecondary} />
            <Text
              style={[
                styles.emptyTitle,
                { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
              ]}
            >
              {t('messages.emptyTitle')}
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: colors.textSecondary, fontFamily: Typography.fontFamilyBody },
              ]}
            >
              {t('messages.emptySubtitle')}
            </Text>
            <TouchableOpacity
              style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
              onPress={handleOpenNewChat}
            >
              <Text style={styles.emptyActionBtnText}>{t('messages.startChatBtn')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listWrap}>
            <FlashList
              data={threads}
              renderItem={renderThread}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* FAB de Nueva Conversación */}
        <Animated.View
          style={[
            styles.fab,
            {
              bottom: Math.max(insets.bottom + 65, 85),
              transform: [{ scale: fabScale }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              animateFab();
              handleOpenNewChat();
            }}
            style={[styles.fabBtn, { backgroundColor: colors.primary }, Shadows.active]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Menú de opciones de conversación seleccionada */}
      <BottomSheet visible={optionsVisible} onClose={() => setOptionsVisible(false)}>
        <View style={styles.sheetContent}>
          <TouchableOpacity
            style={styles.sheetRow}
            activeOpacity={0.7}
            onPress={() => handleOptionPress('open')}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} />
            <Text style={[styles.sheetLabel, { color: colors.textPrimary }]}>Abrir chat</Text>
          </TouchableOpacity>

          {selectedConversation?.isGroup ? (
            <>
              <TouchableOpacity
                style={styles.sheetRow}
                activeOpacity={0.7}
                onPress={() => handleOptionPress('editGroup')}
              >
                <Ionicons name="pencil-outline" size={20} color={colors.textPrimary} />
                <Text style={[styles.sheetLabel, { color: colors.textPrimary }]}>Info del grupo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetRow}
                activeOpacity={0.7}
                onPress={() => handleOptionPress('leaveGroup')}
              >
                <Ionicons name="exit-outline" size={20} color={colors.danger} />
                <Text style={[styles.sheetLabel, { color: colors.danger }]}>Salir del grupo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.sheetRow}
              activeOpacity={0.7}
              onPress={() => handleOptionPress('blockUser')}
            >
              <Ionicons name="ban-outline" size={20} color={colors.danger} />
              <Text style={[styles.sheetLabel, { color: colors.danger }]}>Bloquear usuario</Text>
            </TouchableOpacity>
          )}

          {selectedConversation?.userRole === 'admin' && (
            <TouchableOpacity
              style={styles.sheetRow}
              activeOpacity={0.7}
              onPress={() => handleOptionPress('delete')}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
              <Text style={[styles.sheetLabel, { color: colors.danger }]}>Eliminar conversación</Text>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheet>

      {/* Modal eliminar conversación */}
      <ConfirmDialog
        visible={deleteModalVisible}
        title={t('messages.deleteDialogTitle')}
        message={t('messages.deleteDialogDesc')}
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />

      {/* Modal salir de grupo */}
      <ConfirmDialog
        visible={showLeaveModal}
        title={t('messages.leaveGroupTitle')}
        message={t('messages.leaveGroupDesc')}
        isDestructive={true}
        loading={leaving}
        onConfirm={handleLeaveGroup}
        onCancel={() => setShowLeaveModal(false)}
      />

      {/* Modal nueva conversación */}
      <Modal
        visible={newChatModalVisible}
        animationType="slide"
        onRequestClose={() => setNewChatModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: colors.surface }]}>
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: colors.border + '20', backgroundColor: colors.surface },
            ]}
          >
            <TouchableOpacity
              onPress={() => setNewChatModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text
              style={[
                styles.modalHeaderTitle,
                { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
              ]}
            >
              {t('messages.newChatModalTitle')}
            </Text>
          </View>

          <View
            style={[
              styles.modalSearchRow,
              { backgroundColor: colors.componentBase, borderColor: colors.border + '30' },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            <TextInput
              autoFocus
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder={t('messages.searchFollowingPlaceholder')}
              placeholderTextColor={colors.placeholder}
              style={[styles.modalInput, { color: colors.textPrimary }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {loadingUsers ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.noUsersText, { color: colors.textSecondary }]}>
                {searchQuery
                  ? t('messages.noFollowingFound', { query: searchQuery })
                  : t('messages.notFollowingAnyone')}
              </Text>
            </View>
          ) : (
            <FlashList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={startingChat === item.id}
                  onPress={() => handleSelectUser(item)}
                  style={[styles.userRow, { borderBottomColor: colors.border + '15' }]}
                >
                  <Avatar uri={item.profile_pic_url} name={item.fullname || item.username} size={44} />
                  <View style={styles.userInfo}>
                    <Text
                      style={[
                        styles.userName,
                        { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
                      ]}
                    >
                      {item.fullname || item.username}
                    </Text>
                    <Text style={[styles.userHandle, { color: colors.textSecondary }]}>
                      @{item.username}
                    </Text>
                  </View>
                  {startingChat === item.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  offlineText: {
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  screenTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
  },
  createGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    gap: 6,
  },
  createGroupText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
  },
  listWrap: {
    flex: 1,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  threadInfo: {
    flex: 1,
    gap: 3,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadName: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  threadTime: {
    fontSize: 11.5,
  },
  threadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    fontSize: 13.5,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 18,
    zIndex: 50,
  },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyActionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.full,
    marginTop: 10,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetContent: {
    paddingVertical: 6,
    gap: 2,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 14,
  },
  sheetLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  noUsersText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userHandle: {
    fontSize: 13,
    marginTop: 1,
  },
});
