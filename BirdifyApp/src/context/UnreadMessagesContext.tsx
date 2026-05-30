import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { ChatThread } from '../navigation/AppNavigator';
import { Message } from '../types/message';

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
            ? (c.avatar_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100')
            : (other?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp');

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
          avatar,
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
  }, [user?.id]);

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

      // Reverse DESC → ASC para FlatList (viejos arriba, nuevos abajo)
      const reversedRows = [...rows].reverse();

      // Traer último mensaje leído desde la nueva tabla
      const lastReadId = await ConversationRepository.getLastReadMessageId(conversationId, user.id);

      // Determinar cuáles mensajes están leídos
      let readCutoffIndex = -1;
      if (lastReadId) {
        const lastReadIndex = reversedRows.findIndex((r) => r.id === lastReadId);
        if (lastReadIndex !== -1) {
          readCutoffIndex = lastReadIndex;
        } else {
          // lastReadId no está en el batch: comparar por created_at
          const { data: lastReadMsg } = await supabase
            .from('messages')
            .select('created_at')
            .eq('id', lastReadId)
            .single();
          if (lastReadMsg?.created_at) {
            const lastReadDate = new Date(lastReadMsg.created_at).getTime();
            // El último mensaje leído es el más reciente cuyo created_at <= lastReadDate
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

    const newMessage: Message = {
      id: payload.id,
      text: payload.content || '',
      time: payload.created_at
        ? new Date(payload.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      isMine: payload.sender_id === user.id,
      image: payload.image_url || undefined,
      senderName: undefined, // Se enriquece con fetch separado si es grupo
      senderAvatar: undefined,
      replyToId: payload.reply_to_id || undefined,
      replyToText: undefined,
      replyToUser: undefined,
      replyToImage: undefined,
      createdAt: payload.created_at || undefined,
      isRead: false,
    };

    setMessagesMap(prev => {
      if (!prev[convId]) return prev; // Si no está en memoria, no tocar
      const existing = prev[convId];
      // Evitar duplicados
      if (existing.some(m => m.id === payload.id)) return prev;
      return { ...prev, [convId]: [...existing, newMessage] };
    });
  }, [user?.id]);

  const loadMoreMessages = useCallback(async (conversationId: string) => {
    if (!user) return;
    const existing = messagesMap[conversationId];
    if (!existing || existing.length === 0) return;

    // El primer mensaje del array es el más viejo cargado; usarlo como cursor
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

      // Reverse DESC → ASC
      const reversedRows = [...rows].reverse();

      const lastReadId = await ConversationRepository.getLastReadMessageId(conversationId, user.id);

      // Determinar readCutoff para los mensajes nuevos
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
    if (!user) return;

    refreshConversations();

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
          console.log('[UnreadMessagesContext] conversation_member_states UPDATE:', payload);
          const convId = (payload.new as any)?.conversation_id;
          const oldLastReadId = (payload.old as any)?.last_read_message_id;
          const newLastReadId = (payload.new as any)?.last_read_message_id;

          // Si last_read_message_id cambió, actualizar contador de no leídos
          if (convId && oldLastReadId !== newLastReadId && newLastReadId) {
            console.log('[UnreadMessagesContext] last_read_message_id changed:', { oldLastReadId, newLastReadId });
            setConversations((prev) => {
              const convIndex = prev.findIndex((c) => c.id === convId);
              if (convIndex === -1) return prev;

              const updated = [...prev];
              const conv = { ...updated[convIndex] };

              // Recalcular unreadCount basado en el nuevo last_read_message_id
              // Esto es una aproximación; refreshConversations dará el valor exacto
              if ((conv.unreadCount || 0) > 0) {
                conv.unreadCount = Math.max(0, (conv.unreadCount || 0) - 1);
              }

              updated[convIndex] = conv;
              return updated;
            });

            // Actualizar contador total
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }

          // Refresh completo inmediato para asegurar datos exactos del conteo
          refreshConversations();
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

          // Agregar mensaje incrementalmente en lugar de recargar todo
          if (convId) {
            appendRealtimeMessage(convId, newMessage);
          }

          // Actualizar lista de conversaciones inmediatamente con el nuevo mensaje
          if (convId && senderId !== user.id) {
            setConversations((prev) => {
              const convIndex = prev.findIndex((c) => c.id === convId);
              if (convIndex === -1) return prev;

              const updated = [...prev];
              const conv = { ...updated[convIndex] };

              // Actualizar lastMessage con datos del payload
              // Nota: realtime payload no incluye relaciones join (sender),
              // así que usamos solo el contenido disponible
              const lastMessageText = newMessage.content || (newMessage.image_url ? '📷 Foto' : '');
              const displayMessage = conv.isGroup
                ? `Nuevo mensaje: ${lastMessageText}`
                : lastMessageText;

              conv.lastMessage = displayMessage;
              conv.unreadCount = (conv.unreadCount || 0) + 1;

              // Mover al tope de la lista
              updated.splice(convIndex, 1);
              updated.unshift(conv);

              return updated;
            });

            // Actualizar contador total
            setUnreadCount((prev) => prev + 1);
            setHasNewMessage(true);
            setMessageTick((prev) => prev + 1);

            // Debounced refresh para obtener datos exactos
            debouncedRefresh();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const convId = (payload.new as any)?.conversation_id;
          if (convId) fetchMessages(convId).catch(() => {});
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const convId = (payload.old as any)?.conversation_id;
          if (convId) fetchMessages(convId).catch(() => {});
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_members',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          debouncedRefresh();
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    syncTimerRef.current = setInterval(() => {
      refreshConversations();
    }, 30000);

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
  }, [user?.id, refreshConversations, fetchMessages]);

  const clearNewMessage = useCallback(() => {
    setHasNewMessage(false);
  }, []);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, hasNewMessage, refreshUnread, clearNewMessage, messageTick, conversations, refreshConversations, conversationsLoading, messagesMap, fetchMessages, hasMoreMap, loadMoreMessages, appendRealtimeMessage, }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
