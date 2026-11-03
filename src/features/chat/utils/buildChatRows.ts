import { ChatMessage, ChatRow } from '../types';
import { formatDayLabel } from './formatters';

const GROUP_TIME_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutos

interface BuildChatRowsOptions {
  currentUserId?: string;
  isGroup: boolean;
  locale: string;
  labels: { today: string; yesterday: string };
  firstUnreadMessageId?: string | null;
  unreadCount?: number;
}

export function buildChatRows(
  messages: ChatMessage[],
  options: BuildChatRowsOptions
): ChatRow[] {
  const { currentUserId, isGroup, locale, labels, firstUnreadMessageId, unreadCount } = options;
  const rows: ChatRow[] = [];

  let lastDateKey = '';
  let unreadSeparatorInserted = false;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const prevMsg = i > 0 ? messages[i - 1] : null;
    const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;

    // 1. Separador de fecha
    const msgDate = new Date(msg.createdAt);
    const dateKey = `${msgDate.getFullYear()}-${msgDate.getMonth()}-${msgDate.getDate()}`;
    if (dateKey !== lastDateKey) {
      lastDateKey = dateKey;
      rows.push({
        type: 'date',
        key: `date-${dateKey}`,
        label: formatDayLabel(msg.createdAt, locale, labels),
      });
    }

    // 2. Separador de mensajes no leídos
    if (
      !unreadSeparatorInserted &&
      firstUnreadMessageId &&
      msg.id === firstUnreadMessageId &&
      unreadCount &&
      unreadCount > 0
    ) {
      unreadSeparatorInserted = true;
      rows.push({
        type: 'unread',
        key: 'unread-separator',
        count: unreadCount,
      });
    }

    // 3. Agrupación de mensajes consecutivos
    const isMine = msg.senderId === currentUserId;

    const isPrevSameSender =
      prevMsg &&
      prevMsg.senderId === msg.senderId &&
      new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < GROUP_TIME_THRESHOLD_MS;

    const isNextSameSender =
      nextMsg &&
      nextMsg.senderId === msg.senderId &&
      new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime() < GROUP_TIME_THRESHOLD_MS;

    const isFirstInGroup = !isPrevSameSender;
    const isLastInGroup = !isNextSameSender;
    const showSenderName = isGroup && !isMine && isFirstInGroup;

    rows.push({
      type: 'message',
      key: msg.id,
      message: msg,
      isMine,
      isFirstInGroup,
      isLastInGroup,
      showSenderName,
    });
  }

  return rows;
}

