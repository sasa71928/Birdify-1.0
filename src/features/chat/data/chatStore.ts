import { useSyncExternalStore } from 'react';
import { ChatMessage, ChatBootstrap, ReactionSummary } from '../types';

export interface ConversationState {
  ids: string[];
  byId: Record<string, ChatMessage>;
  loaded: boolean;
  hasMore: boolean;
  loadingOlder: boolean;
  meta?: ChatBootstrap;
  typingUserIds: string[];
  typingUsersMap: Record<string, string>; // userId -> username
  lastAccess: number;
}

const DEFAULT_STATE: ConversationState = {
  ids: [],
  byId: {},
  loaded: false,
  hasMore: true,
  loadingOlder: false,
  typingUserIds: [],
  typingUsersMap: {},
  lastAccess: 0,
};

type StoreListener = () => void;

function getMessageTimestamp(createdAt: string): number {
  const ms = Date.parse(createdAt);
  return Number.isNaN(ms) ? 0 : ms;
}

function compareMessageOrder(
  a: { createdAt: string; id: string },
  b: { createdAt: string; id: string }
): number {
  const diff = getMessageTimestamp(a.createdAt) - getMessageTimestamp(b.createdAt);
  if (diff !== 0) return diff;
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

class ChatStore {
  private state: Record<string, ConversationState> = {};
  private listeners = new Set<StoreListener>();
  private typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: StoreListener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.state;
  };

  getConversation(convId: string): ConversationState {
    return this.state[convId] || DEFAULT_STATE;
  }

  private ensureConversation(convId: string): ConversationState {
    if (!this.state[convId]) {
      this.state[convId] = {
        ...DEFAULT_STATE,
        ids: [],
        byId: {},
        typingUserIds: [],
        typingUsersMap: {},
        lastAccess: Date.now(),
      };
    }
    this.state[convId].lastAccess = Date.now();
    return this.state[convId];
  }

  setMeta(convId: string, meta: ChatBootstrap) {
    const current = this.ensureConversation(convId);
    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        meta,
        lastAccess: Date.now(),
      },
    };
    this.notify();
  }

  setPage(
    convId: string,
    messages: ChatMessage[],
    options: { isPrepend?: boolean; hasMore?: boolean }
  ) {
    const current = this.ensureConversation(convId);
    const byId = { ...current.byId };
    const incomingIds: string[] = [];
    const seenIncoming = new Set<string>();

    for (const msg of messages) {
      const existing = byId[msg.id];
      byId[msg.id] =
        existing && existing.status === 'read' && msg.status === 'sent'
          ? { ...msg, status: 'read' }
          : msg;
      if (!seenIncoming.has(msg.id)) {
        seenIncoming.add(msg.id);
        incomingIds.push(msg.id);
      }
    }

    let nextIds: string[];
    let nextHasMore = options.hasMore !== undefined ? options.hasMore : current.hasMore;

    if (options.isPrepend) {
      // Mensajes históricos anteriores van al inicio de la lista cronológica
      const existingIdsSet = new Set(current.ids);
      const newOldIds = incomingIds.filter((id) => !existingIdsSet.has(id));
      nextIds = [...newOldIds, ...current.ids];
    } else {
      // Carga inicial o resincronización de la última página:
      // 1) Conservar mensajes locales pendientes o fallidos aún no confirmados
      const pendingIds = current.ids.filter((id) => {
        const status = current.byId[id]?.status;
        return (status === 'sending' || status === 'failed') && !seenIncoming.has(id);
      });

      if (incomingIds.length === 0) {
        nextIds = pendingIds;
      } else {
        const oldestIncoming = byId[incomingIds[0]];
        const newestIncoming = byId[incomingIds[incomingIds.length - 1]];

        // 2) Conservar historial más antiguo ya paginado si la conversación ya estaba cargada
        const preservedOlder = current.loaded
          ? current.ids.filter((id) => {
              if (seenIncoming.has(id)) return false;
              const existing = current.byId[id];
              if (!existing || existing.status === 'sending' || existing.status === 'failed') {
                return false;
              }
              return compareMessageOrder(existing, oldestIncoming) < 0;
            })
          : [];

        // 3) Conservar mensajes recién llegados por realtime mientras la petición estaba en vuelo
        const preservedNewer = current.ids.filter((id) => {
          if (seenIncoming.has(id)) return false;
          const existing = current.byId[id];
          if (!existing || existing.status === 'sending' || existing.status === 'failed') {
            return false;
          }
          return compareMessageOrder(existing, newestIncoming) > 0;
        });

        nextIds = [...preservedOlder, ...incomingIds, ...preservedNewer, ...pendingIds];
        if (preservedOlder.length > 0) {
          nextHasMore = current.hasMore;
        }
      }
    }

    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        ids: nextIds,
        byId,
        loaded: true,
        hasMore: nextHasMore,
        loadingOlder: false,
        lastAccess: Date.now(),
      },
    };
    this.notify();
  }

  setLoadingOlder(convId: string, loading: boolean) {
    const current = this.ensureConversation(convId);
    if (current.loadingOlder === loading) return;
    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        loadingOlder: loading,
      },
    };
    this.notify();
  }

  addPendingMessage(convId: string, message: ChatMessage) {
    const current = this.ensureConversation(convId);
    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        ids: [...current.ids, message.id],
        byId: {
          ...current.byId,
          [message.id]: message,
        },
        lastAccess: Date.now(),
      },
    };
    this.notify();
  }

  confirmPendingMessage(convId: string, tempId: string, confirmed: ChatMessage) {
    const current = this.ensureConversation(convId);
    const byId = { ...current.byId };

    if (tempId !== confirmed.id) {
      delete byId[tempId];
      const nextIds = current.ids.map((id) => (id === tempId ? confirmed.id : id));
      byId[confirmed.id] = confirmed;
      this.state = {
        ...this.state,
        [convId]: {
          ...current,
          ids: nextIds,
          byId,
        },
      };
    } else {
      byId[confirmed.id] = confirmed;
      this.state = {
        ...this.state,
        [convId]: {
          ...current,
          byId,
        },
      };
    }
    this.notify();
  }

  failPendingMessage(convId: string, messageId: string) {
    const current = this.ensureConversation(convId);
    const existing = current.byId[messageId];
    if (!existing) return;

    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        byId: {
          ...current.byId,
          [messageId]: {
            ...existing,
            status: 'failed',
          },
        },
      },
    };
    this.notify();
  }

  upsertMessage(convId: string, message: ChatMessage) {
    const current = this.ensureConversation(convId);
    const existing = current.byId[message.id];

    const merged: ChatMessage = existing
      ? {
          ...existing,
          ...message,
          sender: message.sender ?? existing.sender,
          replyTo: message.replyTo ?? existing.replyTo,
          reactions:
            message.reactions && message.reactions.length > 0
              ? message.reactions
              : existing.reactions,
          status:
            existing.status === 'read' && message.status === 'sent' ? 'read' : message.status,
        }
      : message;

    const hadSenderTyping = Boolean(current.typingUsersMap[message.senderId]);

    if (
      existing &&
      !hadSenderTyping &&
      existing.text === merged.text &&
      existing.imagePath === merged.imagePath &&
      existing.isDeleted === merged.isDeleted &&
      existing.status === merged.status &&
      Boolean(existing.sender) === Boolean(merged.sender) &&
      Boolean(existing.replyTo) === Boolean(merged.replyTo) &&
      existing.reactions.length === merged.reactions.length
    ) {
      return;
    }

    const byId = { ...current.byId, [message.id]: merged };

    let nextIds: string[];
    if (current.ids.includes(message.id)) {
      nextIds = current.ids;
    } else if (current.ids.length === 0) {
      nextIds = [message.id];
    } else {
      const lastMsg = current.byId[current.ids[current.ids.length - 1]];
      if (!lastMsg || compareMessageOrder(lastMsg, merged) <= 0) {
        nextIds = [...current.ids, message.id];
      } else {
        const insertIdx = current.ids.findIndex((id) => {
          const item = current.byId[id];
          return item ? compareMessageOrder(merged, item) < 0 : false;
        });
        if (insertIdx === -1) {
          nextIds = [...current.ids, message.id];
        } else {
          nextIds = [
            ...current.ids.slice(0, insertIdx),
            message.id,
            ...current.ids.slice(insertIdx),
          ];
        }
      }
    }

    let nextTypingMap = current.typingUsersMap;
    let nextTypingIds = current.typingUserIds;
    if (hadSenderTyping) {
      const key = `${convId}_${message.senderId}`;
      const existingTimer = this.typingTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
        this.typingTimers.delete(key);
      }
      nextTypingMap = { ...current.typingUsersMap };
      delete nextTypingMap[message.senderId];
      nextTypingIds = Object.keys(nextTypingMap);
    }

    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        ids: nextIds,
        byId,
        typingUsersMap: nextTypingMap,
        typingUserIds: nextTypingIds,
        lastAccess: Date.now(),
      },
    };
    this.notify();
  }

  patchMessage(convId: string, messageId: string, patch: Partial<ChatMessage>) {
    const current = this.ensureConversation(convId);
    const existing = current.byId[messageId];
    if (!existing) return;

    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        byId: {
          ...current.byId,
          [messageId]: {
            ...existing,
            ...patch,
          },
        },
      },
    };
    this.notify();
  }

  removeMessage(convId: string, messageId: string) {
    const current = this.ensureConversation(convId);
    if (!current.byId[messageId]) return;

    const byId = { ...current.byId };
    delete byId[messageId];
    const ids = current.ids.filter((id) => id !== messageId);

    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        ids,
        byId,
      },
    };
    this.notify();
  }

  setReactions(convId: string, messageId: string, reactions: ReactionSummary[]) {
    this.patchMessage(convId, messageId, { reactions });
  }

  markMessagesAsRead(convId: string, upToMessageId: string) {
    const current = this.ensureConversation(convId);
    const byId = { ...current.byId };
    let hasChanges = false;

    // Los mensajes propios ya enviados pasan a status 'read'
    for (const id of current.ids) {
      const msg = byId[id];
      if (msg && msg.status === 'sent') {
        byId[id] = { ...msg, status: 'read' };
        hasChanges = true;
      }
      if (id === upToMessageId) break;
    }

    if (hasChanges) {
      this.state = {
        ...this.state,
        [convId]: {
          ...current,
          byId,
        },
      };
      this.notify();
    }
  }

  setTyping(convId: string, userId: string, username: string, isTyping: boolean) {
    const key = `${convId}_${userId}`;
    const existingTimer = this.typingTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.typingTimers.delete(key);
    }

    const current = this.ensureConversation(convId);
    const map = { ...current.typingUsersMap };

    if (!isTyping) {
      delete map[userId];
    } else {
      map[userId] = username;
      // Auto-expirar typing tras 4 segundos
      const timer = setTimeout(() => {
        this.setTyping(convId, userId, username, false);
      }, 4000);
      this.typingTimers.set(key, timer);
    }

    const typingUserIds = Object.keys(map);
    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        typingUsersMap: map,
        typingUserIds,
      },
    };
    this.notify();
  }

  evictLRU(maxConversations = 8) {
    const entries = Object.entries(this.state);
    if (entries.length <= maxConversations) return;

    entries.sort((a, b) => b[1].lastAccess - a[1].lastAccess);
    const keep = entries.slice(0, maxConversations);
    const newState: Record<string, ConversationState> = {};
    for (const [id, state] of keep) {
      newState[id] = state;
    }
    this.state = newState;
    this.notify();
  }
}

export const chatStore = new ChatStore();

export function useChatConversation<T>(
  convId: string,
  selector: (state: ConversationState) => T
): T {
  return useSyncExternalStore(
    chatStore.subscribe,
    () => selector(chatStore.getConversation(convId)),
    () => selector(DEFAULT_STATE)
  );
}

