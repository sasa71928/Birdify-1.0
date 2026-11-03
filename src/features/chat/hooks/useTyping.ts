import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useChatConversation } from '../data/chatStore';
import { realtimeManager } from '../data/realtimeManager';

export function useTyping(conversationId: string) {
  const { user } = useAuth();
  const typingUserIds = useChatConversation(conversationId, (s) => s.typingUserIds);
  const typingUsersMap = useChatConversation(conversationId, (s) => s.typingUsersMap);
  const lastSignalTimeRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyTyping = useCallback(() => {
    if (!user) return;
    const now = Date.now();
    const myName = user.user_metadata?.fullname || user.user_metadata?.username || 'Usuario';

    // Throttling: emitir como máximo una vez cada 2 segundos
    if (now - lastSignalTimeRef.current > 2000) {
      lastSignalTimeRef.current = now;
      realtimeManager.sendTypingSignal(conversationId, myName, true);
    }

    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      realtimeManager.sendTypingSignal(conversationId, myName, false);
    }, 3500);
  }, [conversationId, user]);

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    };
  }, []);

  const otherTypingUsers = typingUserIds
    .filter((id) => id !== user?.id)
    .map((id) => typingUsersMap[id] || 'Alguien');

  return {
    notifyTyping,
    isOtherTyping: otherTypingUsers.length > 0,
    typingText: otherTypingUsers.length > 0 ? `${otherTypingUsers.join(', ')}` : null,
  };
}

