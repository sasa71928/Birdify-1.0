import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository, CHAT_IMAGE_PREFIX } from '../repositories/message.repository';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { ChatThread } from '../navigation/AppNavigator';
import { Message } from '../types/message';
import { OfflineContext } from './OfflineContext';
import NetInfo from '@react-native-community/netinfo';
import { realtimeManager } from '../features/chat/data/realtimeManager';

interface UnreadMessagesContextType {
  unreadCount: number;
  hasNewMessage: boolean;
  refreshUnread: () => Promise<void>;
  clearNewMessage: () => void;
  messageTick: number;
  conversations: ChatThread[];
  refreshConversations: () => Promise<void>;
  conversationsLoading: boolean;
  messagesMap: Record<string, Message[]>;
  fetchMessages: (conversationId: string) => Promise<void>;
  hasMoreMap: Record<string, boolean>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  appendRealtimeMessage: (convId: string, payload: any) => void;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType>({
  unreadCount: 0,
  hasNewMessage: false,
  refreshUnread: async () => {},
  clearNewMessage: () => {},
  messageTick: 0,
  conversations: [],
  refreshConversations: async () => {},
  conversationsLoading: true,
  messagesMap: {},
  fetchMessages: async () => {},
  hasMoreMap: {},
  loadMoreMessages: async () => {},
  appendRealtimeMessage: () => {},
});

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isOffline = useContext(OfflineContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messageTick, setMessageTick] = useState(0);
  const [conversations, setConversations] = useState<ChatThread[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [hasMoreMap, setHasMoreMap] = useState<Record<string, boolean>>({});
  const subscriptionRef = useRef<any>(null);
  const syncTimerRef = useRef<any>(null);
  const refreshDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshConversations = useCallback(async () => {
    if (!user) return;

    if (isOffline) {
      setConversationsLoading(false);
      return;
    }

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setConversationsLoading(false);
      return;
    }

    try {
      setConversationsLoading(true);
      const items = await ConversationRepository.listForUser(user.id);

      const mapped: ChatThread[] = items.map((item) => {
        const c = item.conversation;
        const members = c.members || [];
        const other = members.find((m: any) => m.user_id !== user.id)?.users;

        const title = c.is_group ? (c.name || 'Group') : (other?.fullname || other?.username || 'Usuario');
        const avatar =
          c.is_group
            ? (c.avatar_url || null)
            : (other?.profile_pic_url || null);

        const lastMessageText = item.lastMessage?.content || (item.lastMessage?.image_url ? '📷 Foto' : '');
        const displayMessage = c.is_group && item.lastMessage?.sender
          ? `${item.lastMessage.sender.fullname || item.lastMessage.sender.username}: ${lastMessageText}`
          : lastMessageText;

        const unreadCount = item.unread || 0;
        const currentMember = members.find((m: any) => m.user_id === user.id);
        const userRole = currentMember?.role || 'member';

        const time = item.lastMessage?.created_at
          ? new Date(item.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';

        return {
          id: c.id,
          name: title,
          avatar: avatar || 'https://gravatar.com/avatar/?d=mp',
          lastMessage: displayMessage || '',
          time,
          unreadCount,
          isGroup: c.is_group,
          userRole,
        };
      });

      setConversations(mapped);
      const totalUnread = mapped.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
      if (totalUnread > 0) {
        setHasNewMessage(true);
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    } finally {
      setConversationsLoading(false);
    }
  }, [user?.id, isOffline]);

  const debouncedRefresh = useCallback(() => {
    if (refreshDebounceRef.current) {
      clearTimeout(refreshDebounceRef.current);
    }
    refreshDebounceRef.current = setTimeout(() => {
      refreshConversations();
    }, 500);
  }, [refreshConversations]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;
    try {
      const { messages: rows, hasMore } = await MessageRepository.listPaginated(conversationId, 50);
      const reversedRows = [...rows].reverse();
      const lastReadId = await ConversationRepository.getLastReadMessageId(conversationId, user.id);

      let readCutoffIndex = -1;
      if (lastReadId) {
        const lastReadIndex = reversedRows.findIndex((r) => r.id === lastReadId);
        if (lastReadIndex !== -1) {
          readCutoffIndex = lastReadIndex;
        } else {
          const { data: lastReadMsg } = await supabase
            .from('messages')
            .select('created_at')
            .eq('id', lastReadId)
            .single();
          if (lastReadMsg?.created_at) {
            const lastReadDate = new Date(lastReadMsg.created_at).getTime();
            for (let i = reversedRows.length - 1; i >= 0; i--) {
              if (reversedRows[i].created_at && new Date(reversedRows[i].created_at!).getTime() <= lastReadDate) {
                readCutoffIndex = i;
                break;
              }
            }
          }
        }
      }

      const mapped: Message[] = reversedRows.map((r, index) => ({
        id: r.id,
        text: r.content || '',
        time: r.created_at
          ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        isMine: r.sender_id === user.id,
        image: r.image_url || undefined,
        senderName: r.sender?.username,
        senderAvatar: r.sender?.profile_pic_url || undefined,
        replyToId: r.reply_to_id || undefined,
        replyToText: r.reply_to?.content || undefined,
        replyToUser: r.reply_to?.sender?.username || undefined,
        replyToImage: r.reply_to?.image_url || undefined,
        createdAt: r.created_at || undefined,
        isRead: readCutoffIndex >= 0 ? index <= readCutoffIndex : false,
      }));

      setMessagesMap((prev) => ({ ...prev, [conversationId]: mapped }));
      setHasMoreMap((prev) => ({ ...prev, [conversationId]: hasMore }));
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
  }, [user?.id]);

  const appendRealtimeMessage = useCallback((convId: string, payload: any) => {
    if (!user) return;

    if (payload.image_url && String(payload.image_url).startsWith(CHAT_IMAGE_PREFIX)) {
      MessageRepository.resolveChatImageUrl(payload.image_url).then((signedUrl) => {
        if (!signedUrl) return;
        setMessagesMap((prev) => {
          const list = prev[convId];
          if (!list) return prev;
          return {
            ...prev,
            [convId]: list.map((m) => (m.id === payload.id ? { ...m, image: signedUrl } : m)),
          };
        });
      });
    }

    const newMessage: Message = {
      id: payload.id,
      text: payload.content || '',
      time: payload.created_at
        ? new Date(payload.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      isMine: payload.sender_id === user.id,
      image: payload.image_url && !String(payload.image_url).startsWith(CHAT_IMAGE_PREFIX) ? payload.image_url : undefined,
      senderName: undefined,
      senderAvatar: undefined,
      replyToId: payload.reply_to_id || undefined,
      replyToText: undefined,
      replyToUser: undefined,
      replyToImage: undefined,
      createdAt: payload.created_at || undefined,
      isRead: false,
    };

    setMessagesMap((prev) => {
      if (!prev[convId]) return prev;
      const existing = prev[convId];
      if (existing.some((m) => m.id === payload.id)) return prev;
      return { ...prev, [convId]: [...existing, newMessage] };
    });
  }, [user?.id]);

  const loadMoreMessages = useCallback(async (conversationId: string) => {
    if (!user) return;
    const existing = messagesMap[conversationId];
    if (!existing || existing.length === 0) return;

    const oldestMessageId = existing[0].id;

    try {
      const { messages: rows, hasMore } = await MessageRepository.listPaginated(
        conversationId,
        50,
        oldestMessageId
      );

      if (rows.length === 0) {
        setHasMoreMap((prev) => ({ ...prev, [conversationId]: false }));
        return;
      }

      const reversedRows = [...rows].reverse();
      const lastReadId = await ConversationRepository.getLastReadMessageId(conversationId, user.id);

      let readCutoffIndex = -1;
      if (lastReadId) {
        const lastReadIndex = reversedRows.findIndex((r) => r.id === lastReadId);
        if (lastReadIndex !== -1) {
          readCutoffIndex = lastReadIndex;
        } else {
          const { data: lastReadMsg } = await supabase
            .from('messages')
            .select('created_at')
            .eq('id', lastReadId)
            .single();
          if (lastReadMsg?.created_at) {
            const lastReadDate = new Date(lastReadMsg.created_at).getTime();
            for (let i = reversedRows.length - 1; i >= 0; i--) {
              if (reversedRows[i].created_at && new Date(reversedRows[i].created_at!).getTime() <= lastReadDate) {
                readCutoffIndex = i;
                break;
              }
            }
          }
        }
      }

      const newMessages: Message[] = reversedRows.map((r, index) => ({
        id: r.id,
        text: r.content || '',
        time: r.created_at
          ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        isMine: r.sender_id === user.id,
        image: r.image_url || undefined,
        senderName: r.sender?.username,
        senderAvatar: r.sender?.profile_pic_url || undefined,
        replyToId: r.reply_to_id || undefined,
        replyToText: r.reply_to?.content || undefined,
        replyToUser: r.reply_to?.sender?.username || undefined,
        replyToImage: r.reply_to?.image_url || undefined,
        createdAt: r.created_at || undefined,
        isRead: readCutoffIndex >= 0 ? index <= readCutoffIndex : false,
      }));

      setMessagesMap((prev) => {
        const current = prev[conversationId] || [];
        const existingIds = new Set(current.map((m) => m.id));
        const merged = [...newMessages.filter((m) => !existingIds.has(m.id)), ...current];
        return { ...prev, [conversationId]: merged };
      });
      setHasMoreMap((prev) => ({ ...prev, [conversationId]: hasMore }));
    } catch (e) {
      console.error('Error loading more messages:', e);
    }
  }, [user?.id, messagesMap]);

  const refreshUnread = useCallback(async () => {
    await refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setMessagesMap({});
      setHasMoreMap({});
      setUnreadCount(0);
      setHasNewMessage(false);
      setConversationsLoading(false);
      return;
    }
    if (isOffline) {
      setConversationsLoading(false);
      return;
    }

    refreshConversations();

    // Inicializar el gestor de realtime optimizado para chat
    realtimeManager.initGlobalSubscription(user.id);

    const channelName = `unread-messages-global-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_member_states',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const convId = (payload.new as any)?.conversation_id;
          const oldLastReadId = (payload.old as any)?.last_read_message_id;
          const newLastReadId = (payload.new as any)?.last_read_message_id;

          if (convId && oldLastReadId !== newLastReadId && newLastReadId) {
            setConversations((prev) => {
              const convIndex = prev.findIndex((c) => c.id === convId);
              if (convIndex === -1) return prev;
              const updated = [...prev];
              const conv = { ...updated[convIndex] };
              if ((conv.unreadCount || 0) > 0) {
                conv.unreadCount = Math.max(0, (conv.unreadCount || 0) - 1);
              }
              updated[convIndex] = conv;
              return updated;
            });
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const senderId = (payload.new as any)?.sender_id;
          const convId = (payload.new as any)?.conversation_id;
          const newMessage = payload.new as any;

          if (convId) {
            appendRealtimeMessage(convId, newMessage);
          }

          if (convId && senderId !== user.id) {
            setConversations((prev) => {
              const convIndex = prev.findIndex((c) => c.id === convId);
              if (convIndex === -1) return prev;

              const updated = [...prev];
              const conv = { ...updated[convIndex] };
              const lastMessageText = newMessage.content || (newMessage.image_url ? '📷 Foto' : '');
              const displayMessage = conv.isGroup
                ? `Nuevo mensaje: ${lastMessageText}`
                : lastMessageText;

              conv.lastMessage = displayMessage;
              conv.unreadCount = (conv.unreadCount || 0) + 1;
              updated.splice(convIndex, 1);
              updated.unshift(conv);
              return updated;
            });

            setUnreadCount((prev) => prev + 1);
            setHasNewMessage(true);
            setMessageTick((prev) => prev + 1);
            debouncedRefresh();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          debouncedRefresh();
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    syncTimerRef.current = setInterval(() => {
      refreshConversations();
    }, 180000);

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
      if (refreshDebounceRef.current) {
        clearTimeout(refreshDebounceRef.current);
      }
    };
  }, [user?.id, refreshConversations, appendRealtimeMessage, debouncedRefresh, isOffline]);

  const clearNewMessage = useCallback(() => {
    setHasNewMessage(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      unreadCount,
      hasNewMessage,
      refreshUnread,
      clearNewMessage,
      messageTick,
      conversations,
      refreshConversations,
      conversationsLoading,
      messagesMap,
      fetchMessages,
      hasMoreMap,
      loadMoreMessages,
      appendRealtimeMessage,
    }),
    [
      unreadCount,
      hasNewMessage,
      refreshUnread,
      clearNewMessage,
      messageTick,
      conversations,
      refreshConversations,
      conversationsLoading,
      messagesMap,
      fetchMessages,
      hasMoreMap,
      loadMoreMessages,
      appendRealtimeMessage,
    ]
  );

  return (
    <UnreadMessagesContext.Provider value={contextValue}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
