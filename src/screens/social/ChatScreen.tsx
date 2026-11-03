import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n';
import AppToast from '../../components/AppToast';
import ReportModal from '../../components/ReportModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BottomSheet } from '../../components/ui/BottomSheet';
import {
  ChatHeader,
  MessageList,
  MessageListRef,
  Composer,
  MessageActionsSheet,
  ImageViewer,
  ChatSkeleton,
  EmptyChat,
  BlockedBanner,
  ChatInfoModal,
} from '../../features/chat/components';
import {
  useChatBootstrap,
  useChatRows,
  useSendMessage,
  useMarkAsRead,
  useTyping,
} from '../../features/chat/hooks';
import { ChatMessage } from '../../features/chat/types';
import { ChatRepository } from '../../features/chat/data/chat.repository';
import { UserBlockRepository } from '../../repositories/user_block.repository';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Typography } from '../../theme';

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const navigation = useNavigation<ChatNavProp>();
  const route = useRoute<ChatRouteProp>();
  const { conversationId } = route.params;

  const { colors, isDark } = useDynamicStyles();
  const { user } = useAuth();
  const { t } = useT();

  const listRef = useRef<MessageListRef>(null);

  // Hooks de datos
  const { meta, loading: metaLoading, refresh: refreshMeta } = useChatBootstrap(conversationId);
  const { rows, loaded, hasMore, loadingOlder, loadOlderMessages } = useChatRows(conversationId);
  const {
    text,
    setText,
    selectedImage,
    setSelectedImage,
    replyingTo,
    setReplyingTo,
    sendMessage,
    retryMessage,
    discardMessage,
  } = useSendMessage(conversationId);

  useMarkAsRead(conversationId);
  const { notifyTyping, isOtherTyping } = useTyping(conversationId);

  // Estados de modales y hojas
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [dialogState, setDialogState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    isDestructive: true,
    onConfirm: () => {},
  });

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  // Acciones sobre mensajes
  const handleToggleReaction = useCallback(
    async (emoji: string, messageId: string) => {
      if (!user) return;
      try {
        await ChatRepository.toggleReaction(messageId, user.id, emoji);
      } catch (e) {
        showToast('Error al reaccionar', 'error');
      }
    },
    [user]
  );

  const handleDeleteForMe = useCallback(
    (msg: ChatMessage) => {
      setDialogState({
        visible: true,
        title: t('chat.deleteDialog.titleForMe'),
        message: t('chat.deleteDialog.descForMe'),
        isDestructive: true,
        onConfirm: async () => {
          if (!user) return;
          try {
            await ChatRepository.deleteForMe(msg.id, user.id);
            setDialogState((prev) => ({ ...prev, visible: false }));
          } catch (e) {
            showToast('No se pudo eliminar el mensaje', 'error');
          }
        },
      });
    },
    [user, t]
  );

  const handleDeleteForEveryone = useCallback(
    (msg: ChatMessage) => {
      setDialogState({
        visible: true,
        title: t('chat.deleteDialog.titleForEveryone'),
        message: t('chat.deleteDialog.descForEveryone'),
        isDestructive: true,
        onConfirm: async () => {
          try {
            await ChatRepository.deleteForEveryone(msg.id);
            setDialogState((prev) => ({ ...prev, visible: false }));
          } catch (e) {
            showToast('No se pudo eliminar el mensaje para todos', 'error');
          }
        },
      });
    },
    [t]
  );

  const handleBlockUser = useCallback(async () => {
    if (!user || !meta?.otherUserId) return;
    try {
      await UserBlockRepository.block(user.id, meta.otherUserId);
      showToast(t('messages.userBlocked'), 'success');
      setTimeout(() => navigation.goBack(), 600);
    } catch (e) {
      showToast('Error al bloquear usuario', 'error');
    }
  }, [user, meta?.otherUserId, navigation, t]);

  const handleUnblockUser = useCallback(async () => {
    if (!user || !meta?.otherUserId) return;
    try {
      await UserBlockRepository.unblock(user.id, meta.otherUserId);
      showToast('Usuario desbloqueado', 'success');
      refreshMeta();
    } catch (e) {
      showToast('Error al desbloquear usuario', 'error');
    }
  }, [user, meta?.otherUserId, refreshMeta]);

  const handleLeaveGroup = useCallback(() => {
    setDialogState({
      visible: true,
      title: t('messages.leaveGroupTitle'),
      message: t('messages.leaveGroupDesc'),
      isDestructive: true,
      onConfirm: async () => {
        if (!user) return;
        try {
          await ConversationRepository.leaveConversation(conversationId, user.id);
          setDialogState((prev) => ({ ...prev, visible: false }));
          showToast(t('messages.leftGroup'), 'success');
          setTimeout(() => navigation.goBack(), 600);
        } catch (e) {
          showToast('No se pudo salir del grupo', 'error');
        }
      },
    });
  }, [conversationId, user, navigation, t]);

  const handlePressInfo = useCallback(() => {
    setShowInfoModal(true);
  }, []);

  const isBlocked = Boolean(meta?.blockedByMe || meta?.blockedMe);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          listRef.current?.scrollToBottom(false);
        }, 50);
      }
    );
    return () => showSub.remove();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Header */}
      <ChatHeader
        meta={meta}
        isOtherTyping={isOtherTyping}
        onBack={() => navigation.goBack()}
        onPressInfo={handlePressInfo}
        onPressMenu={() => setShowMenuSheet(true)}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.chatBody, { backgroundColor: colors.chatBackground }]}>
          {!loaded ? (
            <ChatSkeleton />
          ) : rows.length === 0 ? (
            <EmptyChat
              name={
                meta?.conversation.name ||
                meta?.members.find((m) => m.id === meta?.otherUserId)?.fullname ||
                'Usuario'
              }
              avatarUrl={
                meta?.conversation.is_group
                  ? meta?.conversation.avatar_url
                  : meta?.members.find((m) => m.id === meta?.otherUserId)?.profile_pic_url
              }
              isGroup={Boolean(meta?.conversation.is_group)}
              onSendWave={() => {
                setText('👋');
              }}
            />
          ) : (
            <MessageList
              ref={listRef}
              rows={rows}
              isOtherTyping={isOtherTyping}
              onLoadOlder={loadOlderMessages}
              hasMore={hasMore}
              loadingOlder={loadingOlder}
              onLongPressMessage={(m) => setSelectedMessage(m)}
              onSwipeReply={(m) => setReplyingTo(m)}
              onReplyPress={(replyId) => listRef.current?.scrollToMessageId(replyId)}
              onImagePress={(url) => setFullScreenImage(url)}
              onToggleReaction={handleToggleReaction}
              onRetryMessage={retryMessage}
              onDiscardMessage={discardMessage}
            />
          )}

          {/* Composer o Banner de bloqueo */}
          {isBlocked ? (
            <BlockedBanner
              canUnblock={Boolean(meta?.blockedByMe)}
              onUnblock={handleUnblockUser}
            />
          ) : (
            <Composer
              text={text}
              onChangeText={setText}
              selectedImage={selectedImage}
              onClearImage={() => setSelectedImage(null)}
              onSelectImage={setSelectedImage}
              replyingTo={replyingTo}
              onClearReply={() => setReplyingTo(null)}
              onSend={() => {
                sendMessage();
                listRef.current?.scrollToBottom();
              }}
              onTyping={notifyTyping}
            />
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Menú de opciones de conversación */}
      <BottomSheet visible={showMenuSheet} onClose={() => setShowMenuSheet(false)}>
        <View style={styles.menuList}>
          {meta?.conversation.is_group ? (
            <>
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.7}
                onPress={() => {
                  setShowMenuSheet(false);
                  setShowInfoModal(true);
                }}
              >
                <Ionicons name="information-circle-outline" size={22} color={colors.textPrimary} />
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                  {t('chat.menu.groupInfo')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.7}
                onPress={() => {
                  setShowMenuSheet(false);
                  handleLeaveGroup();
                }}
              >
                <Ionicons name="exit-outline" size={22} color={colors.danger} />
                <Text style={[styles.menuLabel, { color: colors.danger }]}>
                  {t('chat.menu.leaveGroup')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.7}
                onPress={() => {
                  setShowMenuSheet(false);
                  setShowInfoModal(true);
                }}
              >
                <Ionicons name="information-circle-outline" size={22} color={colors.textPrimary} />
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                  {t('chat.chatInfo.userInfo')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.7}
                onPress={() => {
                  setShowMenuSheet(false);
                  setShowReportModal(true);
                }}
              >
                <Ionicons name="flag-outline" size={22} color={colors.warning} />
                <Text style={[styles.menuLabel, { color: colors.warning }]}>
                  {t('chat.menu.reportUser')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.7}
                onPress={() => {
                  setShowMenuSheet(false);
                  if (meta?.blockedByMe) {
                    handleUnblockUser();
                  } else {
                    handleBlockUser();
                  }
                }}
              >
                <Ionicons name="ban-outline" size={22} color={colors.danger} />
                <Text style={[styles.menuLabel, { color: colors.danger }]}>
                  {meta?.blockedByMe ? t('chat.menu.unblockUser') : t('chat.menu.blockUser')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </BottomSheet>

      {/* Menú contextual de mensaje */}
      <MessageActionsSheet
        visible={selectedMessage !== null}
        message={selectedMessage}
        currentUserId={user?.id}
        onClose={() => setSelectedMessage(null)}
        onReply={(m) => setReplyingTo(m)}
        onToggleReaction={handleToggleReaction}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={handleDeleteForEveryone}
        onReport={() => setShowReportModal(true)}
        onShowToast={showToast}
      />

      {/* Visor de imágenes en pantalla completa */}
      <ImageViewer
        visible={fullScreenImage !== null}
        imageUrl={fullScreenImage}
        onClose={() => setFullScreenImage(null)}
      />

      {/* Diálogo de confirmación universal */}
      <ConfirmDialog
        visible={dialogState.visible}
        title={dialogState.title}
        message={dialogState.message}
        isDestructive={dialogState.isDestructive}
        onConfirm={dialogState.onConfirm}
        onCancel={() => setDialogState((prev) => ({ ...prev, visible: false }))}
      />

      {/* Modal de reporte */}
      {user?.id && meta?.otherUserId && (
        <ReportModal
          visible={showReportModal}
          reporterId={user.id}
          reportedUserId={meta.otherUserId}
          targetLabel={meta.conversation.name || 'Usuario'}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => showToast('Reporte enviado correctamente', 'success')}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* Modal de información del chat (fotos compartidas, integrantes, info usuario) */}
      <ChatInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        meta={meta}
        conversationId={conversationId}
        onPressImage={(url) => setFullScreenImage(url)}
        onPressMember={(userId) => navigation.navigate('Profile', { userId })}
        onPressEditGroup={() => navigation.navigate('EditGroup', { conversationId })}
        onPressSearch={() => navigation.navigate('SearchMessages')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  chatBody: {
    flex: 1,
  },
  menuList: {
    paddingVertical: 8,
    gap: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    gap: 14,
  },
  menuLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
});
