import { supabase } from '../../../lib/supabase';
import { chatStore } from './chatStore';
import { resolveChatImageUrl } from './signedUrlCache';
import { ChatMessage, ChatReplyInfo } from '../types';

class RealtimeManager {
  private globalChannel: any = null;
  private activeConvChannel: any = null;
  private currentActiveConvId: string | null = null;
  private currentUserId: string | null = null;

  handleIncomingDbMessage(newMsg: any, userId?: string | null) {
    if (!newMsg?.id || !newMsg?.conversation_id) return;
    const convId = newMsg.conversation_id as string;
    const effectiveUserId = userId ?? this.currentUserId;

    const convState = chatStore.getConversation(convId);
    const existing = convState.byId[newMsg.id];

    // Si el mensaje es propio y ya está confirmado en chatStore, evitar sobrescribirlo
    if (
      existing &&
      effectiveUserId &&
      newMsg.sender_id === effectiveUserId &&
      (existing.status === 'sent' || existing.status === 'read')
    ) {
      return;
    }

    const displayUrl = resolveChatImageUrl(newMsg.image_url);
    const member = convState.meta?.members.find((m) => m.id === newMsg.sender_id);

    let replyTo: ChatReplyInfo | null | undefined = existing?.replyTo;
    if (!replyTo && newMsg.reply_to_id) {
      const repliedMsg = convState.byId[newMsg.reply_to_id];
      if (repliedMsg) {
        replyTo = {
          id: repliedMsg.id,
          text: repliedMsg.text,
          imagePath: repliedMsg.imagePath,
          senderName:
            repliedMsg.sender?.fullname || repliedMsg.sender?.username || 'Usuario',
        };
      }
    }

    const formatted: ChatMessage = {
      id: newMsg.id,
      conversationId: convId,
      senderId: newMsg.sender_id,
      text: newMsg.is_deleted ? null : newMsg.content || null,
      imagePath: newMsg.is_deleted ? null : displayUrl || null,
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
      replyTo: replyTo ?? null,
      reactions: existing?.reactions || [],
      status: newMsg.sender_id === effectiveUserId ? 'sent' : 'read',
    };

    chatStore.upsertMessage(convId, formatted);
  }

  private handleUpdatedDbMessage(updated: any) {
    if (!updated?.conversation_id || !updated?.id) return;
    chatStore.patchMessage(updated.conversation_id, updated.id, {
      text: updated.is_deleted ? null : updated.content,
      imagePath: updated.is_deleted ? null : resolveChatImageUrl(updated.image_url),
      isDeleted: Boolean(updated.is_deleted),
    });
  }

  private handleDeletedDbMessage(oldMsg: any) {
    if (!oldMsg?.conversation_id || !oldMsg?.id) return;
    chatStore.removeMessage(oldMsg.conversation_id, oldMsg.id);
  }

  initGlobalSubscription(userId: string) {
    if (this.globalChannel && this.currentUserId === userId) return;
    this.currentUserId = userId;

    if (this.globalChannel) {
      supabase.removeChannel(this.globalChannel);
      this.globalChannel = null;
    }

    const channel = supabase
      .channel(`chat-global-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          this.handleIncomingDbMessage(payload.new, userId);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          this.handleUpdatedDbMessage(payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          this.handleDeletedDbMessage(payload.old);
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
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          if (err) {
            console.warn('[RealtimeManager] Global channel error:', status, err);
          }
          if (this.globalChannel === channel) {
            this.globalChannel = null;
          }
        }
      });

    this.globalChannel = channel;
  }

  joinConversationChannel(conversationId: string, _currentUsername: string, userId?: string) {
    if (userId) {
      this.currentUserId = userId;
    }
    if (this.currentActiveConvId === conversationId && this.activeConvChannel) return;
    this.leaveConversationChannel();

    this.currentActiveConvId = conversationId;
    const channelName = `chat-room-${conversationId}`;

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId: typingUserId, username, isTyping } = payload.payload || {};
        if (typingUserId && username && typingUserId !== this.currentUserId) {
          chatStore.setTyping(conversationId, typingUserId, username, Boolean(isTyping));
        }
      })
      .on('broadcast', { event: 'read' }, (payload) => {
        const { lastMessageId, userId: readerId } = payload.payload || {};
        if (lastMessageId && readerId !== this.currentUserId) {
          chatStore.markMessagesAsRead(conversationId, lastMessageId);
        }
      })
      .on('broadcast', { event: 'new_message' }, (payload) => {
        const incoming = payload.payload?.message as ChatMessage | undefined;
        if (!incoming?.id || incoming.conversationId !== conversationId) return;
        if (this.currentUserId && incoming.senderId === this.currentUserId) return;

        const meta = chatStore.getConversation(conversationId).meta;
        const member = meta?.members.find((m) => m.id === incoming.senderId);
        const resolvedImage = resolveChatImageUrl(incoming.imagePath);

        chatStore.upsertMessage(conversationId, {
          ...incoming,
          imagePath: resolvedImage,
          sender:
            incoming.sender ||
            (member
              ? {
                  id: member.id,
                  username: member.username,
                  fullname: member.fullname,
                  profile_pic_url: member.profile_pic_url,
                }
              : undefined),
          reactions: Array.isArray(incoming.reactions) ? incoming.reactions : [],
          status: 'read',
        });
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          this.handleIncomingDbMessage(payload.new, this.currentUserId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          this.handleUpdatedDbMessage(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          this.handleDeletedDbMessage(payload.old);
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          if (err) {
            console.warn('[RealtimeManager] Room channel error:', conversationId, status, err);
          }
          if (this.activeConvChannel === channel) {
            this.activeConvChannel = null;
            this.currentActiveConvId = null;
          }
        }
      });

    this.activeConvChannel = channel;
  }

  sendMessageBroadcast(conversationId: string, message: ChatMessage) {
    if (!this.activeConvChannel || this.currentActiveConvId !== conversationId) return;
    this.activeConvChannel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: {
        message: {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          text: message.text,
          imagePath: message.imagePath,
          imageWidth: message.imageWidth ?? null,
          imageHeight: message.imageHeight ?? null,
          createdAt: message.createdAt,
          isDeleted: message.isDeleted,
          sender: message.sender,
          replyTo: message.replyTo ?? null,
          reactions: [],
          status: 'sent',
        },
      },
    });
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
    this.currentUserId = null;
  }
}

export const realtimeManager = new RealtimeManager();

