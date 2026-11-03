import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useChatConversation } from '../data/chatStore';
import { ChatRepository } from '../data/chat.repository';
import { realtimeManager } from '../data/realtimeManager';

export function useMarkAsRead(conversationId: string) {
  const { user } = useAuth();
  const ids = useChatConversation(conversationId, (s) => s.ids);
  const byId = useChatConversation(conversationId, (s) => s.byId);
  const lastReadIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markRead = useCallback(async () => {
    if (!user || ids.length === 0) return;
    if (AppState.currentState !== 'active') return;

    // Buscar el último mensaje que no sea mío
    let lastIncomingId: string | null = null;
    for (let i = ids.length - 1; i >= 0; i--) {
      const msg = byId[ids[i]];
      if (msg && msg.senderId !== user.id) {
        lastIncomingId = msg.id;
        break;
      }
    }

    if (!lastIncomingId || lastIncomingId === lastReadIdRef.current) return;
    lastReadIdRef.current = lastIncomingId;

    try {
      await ChatRepository.markAsRead(conversationId, user.id, lastIncomingId);
      realtimeManager.sendReadSignal(conversationId, lastIncomingId);
    } catch (e) {
      console.warn('[useMarkAsRead] Error marking conversation as read:', e);
    }
  }, [conversationId, ids, byId, user]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      markRead();
    }, 600);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [markRead]);

  return { markRead };
}

