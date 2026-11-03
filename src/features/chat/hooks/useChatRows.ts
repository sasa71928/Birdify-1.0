import { useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useT } from '../../../i18n';
import { useChatConversation } from '../data/chatStore';
import { useChatMessages } from './useChatMessages';
import { buildChatRows } from '../utils/buildChatRows';
import { ChatRow } from '../types';

export function useChatRows(conversationId: string): {
  rows: ChatRow[];
  loaded: boolean;
  hasMore: boolean;
  loadingOlder: boolean;
  loadOlderMessages: () => Promise<void>;
} {
  const { user } = useAuth();
  const { locale, t } = useT();
  const meta = useChatConversation(conversationId, (s) => s.meta);
  const { messages, loaded, hasMore, loadingOlder, loadOlderMessages } = useChatMessages(conversationId);

  const labels = useMemo(
    () => ({
      today: t('common.today'),
      yesterday: t('common.yesterday'),
    }),
    [t]
  );

  const isGroup = Boolean(meta?.conversation.is_group);
  const firstUnreadMessageId = meta?.firstUnreadMessageId;
  const unreadCount = meta?.unreadCount;

  const rows = useMemo(() => {
    return buildChatRows(messages, {
      currentUserId: user?.id,
      isGroup,
      locale,
      labels,
      firstUnreadMessageId,
      unreadCount,
    });
  }, [messages, user?.id, isGroup, locale, labels, firstUnreadMessageId, unreadCount]);

  return {
    rows,
    loaded,
    hasMore,
    loadingOlder,
    loadOlderMessages,
  };
}

