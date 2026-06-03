import React, { useState, useEffect, useContext } from 'react';
import { OfflineContext } from '../../navigation/AppNavigator';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import { RootStackParamList, ChatThread } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/main/messagesScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useMessages } from '../../hooks/useMessages';
import AppToast from '../../components/AppToast';
import { useAuth } from '../../context/AuthContext';
import { FollowRepository } from '../../repositories/follow.repository';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { handleError } from '../../utils/errorHandler';

export default function MessagesScreen() {
  const { shared, screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const isOffline = useContext(OfflineContext); 
  const { user } = useAuth();
  const {
    loading,
    threads,
    deleteModalVisible,
    conversationToDelete,
    optionsVisible,
    selectedConversation,
    menuPosition,
    showLeaveModal,
    leaving,
    toast,
    navigation,
    setDeleteModalVisible,
    setConversationToDelete,
    setOptionsVisible,
    setSelectedConversation,
    setMenuPosition,
    setShowLeaveModal,
    setToast,
    load,
    confirmDelete,
    handleLongPress,
    handleOptionPress,
    handleLeaveGroup,
    handleBlockUser,
  } = useMessages();

  // ── New Conversation Modal state ──────────────────────────────────────────
  const [newChatModalVisible, setNewChatModalVisible] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const fabScale = useState(new Animated.Value(1))[0];

  if (isOffline) {
    return (
      <SafeAreaView style={shared.safe}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <TopNavBar />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Ionicons name="chatbubble-outline" size={48} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 16, textAlign: 'center' }}>
            Los mensajes no están disponibles sin conexión
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const loadFollowingUsers = async () => {
    if (!user) return;
    setLoadingUsers(true);
    try {
      const following = await FollowRepository.getFollowing(user.id);
      setFollowingUsers(following);
      setFilteredUsers(following);
    } catch (e) {
      handleError(e, setToast, 'No se pudo cargar la lista de contactos');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenNewChat = () => {
    setSearchQuery('');
    setNewChatModalVisible(true);
    loadFollowingUsers();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredUsers(followingUsers);
      return;
    }
    const lower = text.toLowerCase();
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

  // ── Thread item ───────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={[styles.threadItem, item.unreadCount ? styles.unreadThread : null]}
      activeOpacity={0.75}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
      onLongPress={(event) => handleLongPress(item, event)}
    >
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
          item.avatar &&
          item.avatar !==
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100' ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.groupAvatar}>
              <Ionicons name="people" size={24} color={colors.secondaryBlue} />
            </View>
          )
        ) : (
          <Image
            source={{ uri: item.avatar || 'https://gravatar.com/avatar/?d=mp' }}
            style={styles.avatar}
          />
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.threadInfo}>
        <View style={styles.threadHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.threadFooter}>
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage}
          </Text>
          {item.unreadCount ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TopNavBar />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <View style={[styles.container, { position: 'relative' }]}>
        {/* Header */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Messages</Text>
          <TouchableOpacity
            style={styles.createGroupBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <MaterialCommunityIcons
              name="account-multiple-plus-outline"
              size={20}
              color={colors.canvasPure}
            />
            <Text style={styles.createGroupText}>New Group</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SearchMessages')}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search messages...</Text>
        </TouchableOpacity>

        {loading && threads.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              data={threads}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.listContent, { paddingBottom: 90 }]}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* FAB — New conversation */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 100,
            right: 16,
            transform: [{ scale: fabScale }],
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              animateFab();
              handleOpenNewChat();
            }}
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.22,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={26} color={colors.canvasPure} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── New Conversation Modal ── */}
      <Modal
        visible={newChatModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setNewChatModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          {/* Modal header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border + '20',
              backgroundColor: colors.surface,
            }}
          >
            <TouchableOpacity
              onPress={() => setNewChatModalVisible(false)}
              style={{ marginRight: 12, padding: 4 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.textPrimary,
                flex: 1,
              }}
            >
              New Conversation
            </Text>
          </View>

          {/* Search input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              margin: 16,
              paddingHorizontal: 14,
              paddingVertical: 10,
              backgroundColor: colors.componentBase,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border + '30',
            }}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              autoFocus
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search people you follow..."
              placeholderTextColor={colors.placeholder}
              style={{ flex: 1, fontSize: 15, color: colors.textPrimary }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* User list */}
          {loadingUsers ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredUsers.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 32,
              }}
            >
              <Ionicons
                name="people-outline"
                size={52}
                color={colors.textSecondary}
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: 22,
                }}
              >
                {searchQuery
                  ? `No users found for "${searchQuery}"`
                  : "You're not following anyone yet."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.75}
                  disabled={startingChat === item.id}
                  onPress={() => handleSelectUser(item)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border + '15',
                  }}
                >
                  <Image
                    source={{
                      uri: item.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
                    }}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      marginRight: 14,
                      backgroundColor: colors.componentBase,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: colors.textPrimary,
                      }}
                    >
                      {item.fullname || item.username}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      @{item.username}
                    </Text>
                  </View>
                  {startingChat === item.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Delete Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="trash-outline" size={48} color="#FF6B6B" />
            </View>
            <Text style={styles.modalTitle}>Eliminar conversación</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede
              deshacer.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setConversationToDelete(null);
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonTextDelete}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Options Modal */}
      {optionsVisible && menuPosition && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setOptionsVisible(false)}
          />
          <View
            style={{
              position: 'absolute',
              left: Math.max(
                10,
                Math.min(menuPosition.x - 100, Dimensions.get('window').width - 210)
              ),
              top: Math.min(menuPosition.y, Dimensions.get('window').height - 150),
              backgroundColor: colors.canvasPure,
              borderRadius: 12,
              padding: 8,
              width: 200,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <TouchableOpacity
              onPress={() => handleOptionPress('open')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 12,
              }}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} />
              <Text
                style={{ marginLeft: 10, color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}
              >
                Abrir chat
              </Text>
            </TouchableOpacity>
            {selectedConversation?.isGroup && (
              <>
                <TouchableOpacity
                  onPress={() => handleOptionPress('editGroup')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                >
                  <Ionicons name="pencil-outline" size={20} color={colors.textPrimary} />
                  <Text
                    style={{
                      marginLeft: 10,
                      color: colors.textPrimary,
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    Editar grupo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleOptionPress('leaveGroup')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                >
                  <Ionicons name="exit-outline" size={20} color="#FF5252" />
                  <Text
                    style={{ marginLeft: 10, color: '#FF5252', fontWeight: '600', fontSize: 14 }}
                  >
                    Salir del grupo
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {!selectedConversation?.isGroup && (
              <TouchableOpacity
                onPress={() => handleOptionPress('blockUser')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Ionicons name="ban-outline" size={20} color="#FF5252" />
                <Text
                  style={{ marginLeft: 10, color: '#FF5252', fontWeight: '600', fontSize: 14 }}
                >
                  Bloquear usuario
                </Text>
              </TouchableOpacity>
            )}
            {selectedConversation?.userRole === 'admin' && (
              <TouchableOpacity
                onPress={() => handleOptionPress('delete')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#FF5252" />
                <Text
                  style={{ marginLeft: 10, color: '#FF5252', fontWeight: '600', fontSize: 14 }}
                >
                  Eliminar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Leave Group Modal */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="exit-outline" size={48} color="#FF5252" />
            </View>
            <Text style={styles.modalTitle}>Salir del grupo</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que quieres salir de este grupo? Ya no podrás ver ni enviar mensajes.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLeaveModal(false)}
                disabled={leaving}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonLeave]}
                onPress={handleLeaveGroup}
                disabled={leaving}
              >
                {leaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalButtonTextLeave}>Salir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}