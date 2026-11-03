import { supabase } from '../../../lib/supabase';
import { chatStore } from './chatStore';
import { resolveChatImageUrl } from './signedUrlCache';
import { ChatMessage } from '../types';

class RealtimeManager {
  private globalChannel: any = null;
  private activeConvChannel: any = null;
  private currentActiveConvId: string | null = null;
  private currentUserId: string | null = null;

  initGlobalSubscription(userId: string) {
    if (this.globalChannel && this.currentUserId === userId) return;
    this.currentUserId = userId;

    if (this.globalChannel) {
      supabase.removeChannel(this.globalChannel);
    }

    const channel = supabase
      .channel(`chat-global-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as any;
          if (!newMsg?.conversation_id) return;
          const convId = newMsg.conversation_id;

          // Si el mensaje es mío y ya está en chatStore como pending/sent, ignorar duplicado
          const existing = chatStore.getConversation(convId).byId[newMsg.id];
          if (existing && existing.status === 'sent') return;

          const displayUrl = resolveChatImageUrl(newMsg.image_url);

          // Obtener datos del remitente desde la metadata en caché de la conversación
          const meta = chatStore.getConversation(convId).meta;
          const member = meta?.members.find((m) => m.id === newMsg.sender_id);

          const formatted: ChatMessage = {
            id: newMsg.id,
            conversationId: convId,
            senderId: newMsg.sender_id,
            text: newMsg.content || null,
            imagePath: displayUrl || null,
            imageWidth: newMsg.image_width || null,
            imageHeight: newMsg.image_height || null,
            createdAt: newMsg.created_at,
            isDeleted: Boolean(newMsg.is_deleted),
            sender: member
              ? {
                  id: member.id,
                  username: member.username,
                  fullname: member.fullname,
                  profile_pic_url: member.profile_pic_url,
                }
              : undefined,
            reactions: [],
            status: newMsg.sender_id === userId ? 'sent' : 'read',
          };

          chatStore.upsertMessage(convId, formatted);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const updated = payload.new as any;
          if (!updated?.conversation_id || !updated?.id) return;
          chatStore.patchMessage(updated.conversation_id, updated.id, {
            text: updated.is_deleted ? null : updated.content,
            imagePath: updated.is_deleted ? null : updated.image_url,
            isDeleted: Boolean(updated.is_deleted),
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          const oldMsg = payload.old as any;
          if (!oldMsg?.conversation_id || !oldMsg?.id) return;
          chatStore.removeMessage(oldMsg.conversation_id, oldMsg.id);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        (payload) => {
          const record = (payload.new || payload.old) as any;
          if (!record?.message_id) return;
          // Actualización de reacciones
        }
      )
      .subscribe();

    this.globalChannel = channel;
  }

  joinConversationChannel(conversationId: string, currentUsername: string) {
    if (this.currentActiveConvId === conversationId && this.activeConvChannel) return;
    this.leaveConversationChannel();

    this.currentActiveConvId = conversationId;
    const channelName = `chat-room-${conversationId}`;

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, username, isTyping } = payload.payload || {};
        if (userId && username && userId !== this.currentUserId) {
          chatStore.setTyping(conversationId, userId, username, Boolean(isTyping));
        }
      })
      .on('broadcast', { event: 'read' }, (payload) => {
        const { lastMessageId, userId } = payload.payload || {};
        if (lastMessageId && userId !== this.currentUserId) {
          chatStore.markMessagesAsRead(conversationId, lastMessageId);
        }
      })
      .subscribe();

    this.activeConvChannel = channel;
  }

  sendTypingSignal(conversationId: string, username: string, isTyping: boolean) {
    if (!this.activeConvChannel || this.currentActiveConvId !== conversationId) return;
    this.activeConvChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: this.currentUserId,
        username,
        isTyping,
      },
    });
  }

  sendReadSignal(conversationId: string, lastMessageId: string) {
    if (!this.activeConvChannel || this.currentActiveConvId !== conversationId) return;
    this.activeConvChannel.send({
      type: 'broadcast',
      event: 'read',
      payload: {
        userId: this.currentUserId,
        lastMessageId,
      },
    });
  }

  leaveConversationChannel() {
    if (this.activeConvChannel) {
      supabase.removeChannel(this.activeConvChannel);
      this.activeConvChannel = null;
    }
    this.currentActiveConvId = null;
  }

  destroy() {
    if (this.globalChannel) {
      supabase.removeChannel(this.globalChannel);
      this.globalChannel = null;
    }
    this.leaveConversationChannel();
  }
}

export const realtimeManager = new RealtimeManager();

