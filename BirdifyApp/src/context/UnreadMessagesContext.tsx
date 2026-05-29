import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ConversationRepository } from '../repositories/conversation.repository';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { ChatThread } from '../navigation/AppNavigator';

interface UnreadMessagesContextType {
  unreadCount: number;
  hasNewMessage: boolean;
  refreshUnread: () => Promise<void>;
  clearNewMessage: () => void;
  messageTick: number;
  conversations: ChatThread[];
  refreshConversations: () => Promise<void>;
  conversationsLoading: boolean;
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
});

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messageTick, setMessageTick] = useState(0);
  const [conversations, setConversations] = useState<ChatThread[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);
  const syncTimerRef = useRef<any>(null);

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

        return {
          id: c.id,
          name: title,
          avatar,
          lastMessage: displayMessage || '',
          time: '',
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
          event: '*',
          schema: 'public',
          table: 'message_reads',
        },
        () => {
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
          if (senderId !== user.id) {
            setUnreadCount((prev) => prev + 1);
            setHasNewMessage(true);
            setMessageTick((prev) => prev + 1);
          }
          // Pequeño delay para dar tiempo a la DB de propagar el nuevo mensaje
          setTimeout(() => {
            refreshConversations();
          }, 300);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          refreshConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          refreshConversations();
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
          refreshConversations();
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
          refreshConversations();
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    syncTimerRef.current = setInterval(() => {
      refreshConversations();
    }, 3000);

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [user?.id, refreshConversations]);

  const clearNewMessage = useCallback(() => {
    setHasNewMessage(false);
  }, []);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, hasNewMessage, refreshUnread, clearNewMessage, messageTick, conversations, refreshConversations, conversationsLoading }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
