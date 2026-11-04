import React, { useState, useContext, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import TopNavBar from '../../components/TopNavBar';
import { ChatThread } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/main/messagesScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../context/AuthContext';
import { OfflineContext } from '../../context/OfflineContext';
import { MessagesSkeleton } from '../../components/skeleton';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import { Avatar } from '../../components/ui/Avatar';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { NewConversationModal } from '../../features/chat/components/NewConversationModal';
import { Typography, Radius, Spacing, Shadows } from '../../theme';
import { useT } from '../../i18n';
import { formatThreadTime } from '../../features/chat/utils/formatters';

export default function MessagesScreen() {
  const { shared, screen: styles, colors, isDark } = useDynamicStyles(createStyles);
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

  const fabScale = useRef(new Animated.Value(1)).current;

  const labels = useMemo(
    () => ({
      today: t('common.today'),
      yesterday: t('common.yesterday'),
    }),
    [t]
  );

  const handleOpenNewChat = () => {
    setNewChatModalVisible(true);
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
      <NewConversationModal
        visible={newChatModalVisible}
        onClose={() => setNewChatModalVisible(false)}
        user={user}
        navigation={navigation}
        setToast={setToast}
        styles={styles}
        colors={colors}
      />
    </SafeAreaView>
  );
}
