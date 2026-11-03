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

    for (const msg of messages) {
      byId[msg.id] = msg;
      incomingIds.push(msg.id);
    }

    let nextIds: string[];
    if (options.isPrepend) {
      // Mensajes históricos anteriores van al inicio de la lista cronológica
      const existingIdsSet = new Set(current.ids);
      const newOldIds = incomingIds.filter((id) => !existingIdsSet.has(id));
      nextIds = [...newOldIds, ...current.ids];
    } else {
      // Carga inicial o reemplazo
      // Mantener mensajes locales pendientes si los hubiera
      const pendingIds = current.ids.filter((id) => current.byId[id]?.status === 'sending');
      const incomingSet = new Set(incomingIds);
      const preservedPending = pendingIds.filter((id) => !incomingSet.has(id));
      nextIds = [...incomingIds, ...preservedPending];
    }

    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        ids: nextIds,
        byId,
        loaded: true,
        hasMore: options.hasMore !== undefined ? options.hasMore : current.hasMore,
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
    const byId = { ...current.byId, [message.id]: message };
    const nextIds = current.ids.includes(message.id)
      ? current.ids
      : [...current.ids, message.id];

    this.state = {
      ...this.state,
      [convId]: {
        ...current,
        ids: nextIds,
        byId,
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

