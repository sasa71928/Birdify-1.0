import { useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChatRepository } from '../data/chat.repository';
import { chatStore, useChatConversation } from '../data/chatStore';
import { ChatMessage } from '../types';

export function useChatMessages(conversationId: string) {
  const ids = useChatConversation(conversationId, (s) => s.ids);
  const byId = useChatConversation(conversationId, (s) => s.byId);
  const loaded = useChatConversation(conversationId, (s) => s.loaded);
  const hasMore = useChatConversation(conversationId, (s) => s.hasMore);
  const loadingOlder = useChatConversation(conversationId, (s) => s.loadingOlder);

  const activeConvRef = useRef(conversationId);
  const inFlightRef = useRef(false);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    activeConvRef.current = conversationId;
    inFlightRef.current = false;
  }, [conversationId]);

  const refreshLatest = useCallback(async () => {
    if (!conversationId || inFlightRef.current) return;

    const targetConvId = conversationId;
    const seq = ++requestSeqRef.current;
    inFlightRef.current = true;

    try {
      const { messages, hasMore: more } = await ChatRepository.fetchMessagesPage(targetConvId, {
        limit: 40,
      });

      if (activeConvRef.current !== targetConvId || requestSeqRef.current !== seq) {
        return;
      }

      chatStore.setPage(targetConvId, messages, { isPrepend: false, hasMore: more });
    } catch (e) {
      console.warn('[useChatMessages] Refresh latest error:', e);
    } finally {
      if (activeConvRef.current === targetConvId && requestSeqRef.current === seq) {
        inFlightRef.current = false;
      }
    }
  }, [conversationId]);

  // Sincronizar la última página siempre al entrar o volver a enfocar el chat,
  // y también al regresar desde segundo plano mientras el chat está activo.
  // Si ya estaba en caché, se renderiza de inmediato sin skeleton mientras se actualiza.
  useFocusEffect(
    useCallback(() => {
      refreshLatest();

      const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          refreshLatest();
        }
      });

      return () => {
        subscription.remove();
      };
    }, [refreshLatest])
  );

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
    refreshLatest,
  };
}

