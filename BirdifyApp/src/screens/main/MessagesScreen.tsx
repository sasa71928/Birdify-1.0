import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import { RootStackParamList, ChatThread } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/main/messagesScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useMessages } from '../../hooks/useMessages';
import AppToast from '../../components/AppToast';

export default function MessagesScreen() {
  const { shared, screen: styles, colors, isDark } = useDynamicStyles(createStyles);
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

  const renderItem = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={[styles.threadItem, item.unreadCount ? styles.unreadThread : null]}
      activeOpacity={0.75}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
      onLongPress={(event) => handleLongPress(item, event)}
    >
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
            item.avatar && item.avatar !== 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100' ? (
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
                <View style={styles.groupAvatar}>
                    <Ionicons name="people" size={24} color={colors.secondaryBlue} />
                </View>
            )
        ) : (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.threadInfo}>
        <View style={styles.threadHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.threadFooter}>
          <Text style={styles.lastMessage} numberOfLines={2}>{item.lastMessage}</Text>
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
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

      <View style={styles.container}>
        {/* ── Encabezado con título y botón crear grupo ── */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Messages</Text>
          <TouchableOpacity style={styles.createGroupBtn} activeOpacity={0.8} onPress={() => navigation.navigate('CreateGroup')}>
            <MaterialCommunityIcons name="account-multiple-plus-outline" size={20} color={colors.canvasPure} />
            <Text style={styles.createGroupText}>New Group</Text>
          </TouchableOpacity>
        </View>

        {/* ── Búsqueda ── */}
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SearchMessages')}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search messages...</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={threads}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Custom Delete Modal */}
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
              ¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.
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
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setOptionsVisible(false)} />
          <View
            style={{
              position: 'absolute',
              left: Math.max(10, Math.min(menuPosition.x - 100, Dimensions.get('window').width - 210)),
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
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 }}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} />
              <Text style={{ marginLeft: 10, color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>Abrir chat</Text>
            </TouchableOpacity>
            {selectedConversation?.isGroup && (
              <>
                <TouchableOpacity
                  onPress={() => handleOptionPress('editGroup')}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 }}
                >
                  <Ionicons name="pencil-outline" size={20} color={colors.textPrimary} />
                  <Text style={{ marginLeft: 10, color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>Editar grupo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleOptionPress('leaveGroup')}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 }}
                >
                  <Ionicons name="exit-outline" size={20} color="#FF5252" />
                  <Text style={{ marginLeft: 10, color: '#FF5252', fontWeight: '600', fontSize: 14 }}>Salir del grupo</Text>
                </TouchableOpacity>
              </>
            )}
            {!selectedConversation?.isGroup && (
              <TouchableOpacity
                onPress={() => handleOptionPress('blockUser')}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 }}
              >
                <Ionicons name="ban-outline" size={20} color="#FF5252" />
                <Text style={{ marginLeft: 10, color: '#FF5252', fontWeight: '600', fontSize: 14 }}>Bloquear usuario</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleOptionPress('delete')}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5252" />
              <Text style={{ marginLeft: 10, color: '#FF5252', fontWeight: '600', fontSize: 14 }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Leave Group Confirmation Modal */}
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

      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

