import { useEffect, useCallback, useRef } from 'react';
import { ChatRepository } from '../data/chat.repository';
import { chatStore, useChatConversation } from '../data/chatStore';
import { ChatMessage } from '../types';

export function useChatMessages(conversationId: string) {
  const ids = useChatConversation(conversationId, (s) => s.ids);
  const byId = useChatConversation(conversationId, (s) => s.byId);
  const loaded = useChatConversation(conversationId, (s) => s.loaded);
  const hasMore = useChatConversation(conversationId, (s) => s.hasMore);
  const loadingOlder = useChatConversation(conversationId, (s) => s.loadingOlder);

  const initialLoadDone = useRef(false);

  // Carga inicial
  useEffect(() => {
    if (!conversationId) return;

    const loadInitial = async () => {
      try {
        const { messages, hasMore: more } = await ChatRepository.fetchMessagesPage(conversationId, {
          limit: 40,
        });
        chatStore.setPage(conversationId, messages, { isPrepend: false, hasMore: more });
        initialLoadDone.current = true;
      } catch (e) {
        console.warn('[useChatMessages] Initial load error:', e);
      }
    };

    if (!loaded && !initialLoadDone.current) {
      loadInitial();
    }
  }, [conversationId, loaded]);

  // Carga paginada hacia arriba (mensajes más antiguos)
  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || loadingOlder || ids.length === 0) return;

    const oldestId = ids[0];
    const oldestMsg = byId[oldestId];
    if (!oldestMsg) return;

    chatStore.setLoadingOlder(conversationId, true);
    try {
      const { messages, hasMore: more } = await ChatRepository.fetchMessagesPage(conversationId, {
        beforeCreatedAt: oldestMsg.createdAt,
        beforeId: oldestMsg.id,
        limit: 40,
      });

      if (messages.length > 0) {
        chatStore.setPage(conversationId, messages, { isPrepend: true, hasMore: more });
      } else {
        chatStore.setPage(conversationId, [], { isPrepend: true, hasMore: false });
      }
    } catch (e) {
      console.warn('[useChatMessages] Load older error:', e);
    } finally {
      chatStore.setLoadingOlder(conversationId, false);
    }
  }, [conversationId, hasMore, loadingOlder, ids, byId]);

  const messages: ChatMessage[] = ids.map((id) => byId[id]).filter(Boolean);

  return {
    messages,
    loaded,
    hasMore,
    loadingOlder,
    loadOlderMessages,
  };
}

