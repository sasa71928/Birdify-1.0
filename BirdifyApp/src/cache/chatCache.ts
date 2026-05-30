export interface CachedMessage {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  image?: string;
  senderName?: string;
  senderAvatar?: string;
  replyToId?: string;
  replyToText?: string;
  replyToUser?: string;
  replyToImage?: string;
  createdAt?: string;
  isRead?: boolean;
}

interface CacheEntry {
  messages: CachedMessage[];
  timestamp: number;
}

const messageCache = new Map<string, CacheEntry>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const ChatCache = {
  getMessages(conversationId: string): CachedMessage[] | null {
    const entry = messageCache.get(conversationId);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      messageCache.delete(conversationId);
      return null;
    }
    return entry.messages;
  },

  setMessages(conversationId: string, messages: CachedMessage[]) {
    messageCache.set(conversationId, {
      messages,
      timestamp: Date.now(),
    });
  },

  clearConversation(conversationId: string) {
    messageCache.delete(conversationId);
  },

  clearAll() {
    messageCache.clear();
  },
};
