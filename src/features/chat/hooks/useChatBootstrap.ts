import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ChatBootstrap } from '../types';
import { ChatRepository } from '../data/chat.repository';
import { chatStore, useChatConversation } from '../data/chatStore';
import { realtimeManager } from '../data/realtimeManager';

export function useChatBootstrap(conversationId: string) {
  const { user } = useAuth();
  const cachedMeta = useChatConversation(conversationId, (s) => s.meta);
  const [loading, setLoading] = useState(!cachedMeta);
  const [error, setError] = useState<string | null>(null);

  const loadBootstrap = useCallback(async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ChatRepository.bootstrap(conversationId);
      chatStore.setMeta(conversationId, data);
    } catch (e: any) {
      setError(e?.message || 'Error cargando conversación');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadBootstrap();

    if (user?.id) {
      realtimeManager.joinConversationChannel(conversationId, user.email || 'user');
    }

    return () => {
      realtimeManager.leaveConversationChannel();
    };
  }, [conversationId, user?.id, loadBootstrap]);

  return {
    meta: cachedMeta,
    loading,
    error,
    refresh: loadBootstrap,
  };
}

