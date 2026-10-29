import { supabase } from '../lib/supabase';

export const CHAT_IMAGE_PREFIX = 'storage://chat-images/';
const CHAT_IMAGES_BUCKET = 'chat-images';
const SIGNED_URL_TTL_SECONDS = 3600;

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  reply_to_id: string | null;
  created_at?: string;
  sender?: {
    id: string;
    username: string;
    profile_pic_url: string | null;
  };
  reply_to?: {
    content: string | null;
    image_url: string | null;
    sender: {
      username: string;
      fullname?: string | null;
    };
  };
}

interface ReplyMessageRow {
  id: string;
  content: string | null;
  image_url: string | null;
  sender?:
    | { username: string; fullname: string | null }
    | Array<{ username: string; fullname: string | null }>
    | null;
}

export interface PaginatedMessagesResult {
  messages: MessageRow[];
  hasMore: boolean;
}

function extractStoragePath(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || !imageUrl.startsWith(CHAT_IMAGE_PREFIX)) return null;
  return imageUrl.slice(CHAT_IMAGE_PREFIX.length);
}

function isLocalFileUri(uri: string): boolean {
  return (
    !uri.startsWith('http://') &&
    !uri.startsWith('https://') &&
    !uri.startsWith(CHAT_IMAGE_PREFIX)
  );
}

export const MessageRepository = {
  async uploadChatImage(
    conversationId: string,
    senderId: string,
    localUri: string
  ): Promise<string> {
    const cleanUri = localUri.split('?')[0];
    const rawExt = cleanUri.split('.').pop()?.toLowerCase() || 'jpg';
    const ext = rawExt === 'png' || rawExt === 'webp' ? rawExt : 'jpg';
    const mimeType =
      ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const storagePath = `${conversationId}/${senderId}_${Date.now()}.${ext}`;

    const response = await fetch(localUri);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from(CHAT_IMAGES_BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`No se pudo subir la imagen del chat: ${error.message}`);
    }

    return `${CHAT_IMAGE_PREFIX}${storagePath}`;
  },

  async resolveChatImageUrls(
    rawUrls: Array<string | null | undefined>
  ): Promise<Map<string, string>> {
    const paths = Array.from(
      new Set(
        rawUrls
          .map((u) => extractStoragePath(u))
          .filter((p): p is string => Boolean(p))
      )
    );
    const resolved = new Map<string, string>();
    if (paths.length === 0) return resolved;

    const { data, error } = await supabase.storage
      .from(CHAT_IMAGES_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

    if (error || !data) return resolved;

    for (const entry of data) {
      if (entry.path && entry.signedUrl) {
        resolved.set(`${CHAT_IMAGE_PREFIX}${entry.path}`, entry.signedUrl);
      }
    }
    return resolved;
  },

  async resolveChatImageUrl(rawUrl: string | null | undefined): Promise<string | null> {
    if (!rawUrl) return null;
    const path = extractStoragePath(rawUrl);
    if (!path) return rawUrl;

    const { data, error } = await supabase.storage
      .from(CHAT_IMAGES_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  },

  async list(conversationId: string): Promise<MessageRow[]> {
    const result = await this.listPaginated(conversationId, 100);
    return result.messages;
  },

  async listPaginated(
    conversationId: string,
    limit: number = 50,
    beforeMessageId?: string
  ): Promise<PaginatedMessagesResult> {
    let query = supabase
      .from('messages')
      .select(
        `
        id,
        conversation_id,
        sender_id,
        content,
        image_url,
        reply_to_id,
        created_at,
        sender:users (id, username, profile_pic_url)
      `
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (beforeMessageId) {
      const { data: cursorMsg } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', beforeMessageId)
        .single();
      if (cursorMsg) {
        query = query.lt('created_at', cursorMsg.created_at);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const messages = (data || []) as unknown as MessageRow[];

    const replyToIds = messages
      .map((m) => m.reply_to_id)
      .filter((id): id is string => id != null);

    if (replyToIds.length > 0) {
      const { data: replyData } = await supabase
        .from('messages')
        .select('id, content, image_url, sender:users (username, fullname)')
        .in('id', replyToIds);

      const typedReplies = (replyData || []) as unknown as ReplyMessageRow[];
      const replyMap = new Map<string, ReplyMessageRow>(
        typedReplies.map((r) => [r.id, r])
      );

      messages.forEach((m) => {
        if (m.reply_to_id) {
          const reply = replyMap.get(m.reply_to_id);
          if (reply) {
            const senderData = Array.isArray(reply.sender)
              ? reply.sender[0]
              : reply.sender;
            const username =
              senderData?.fullname || senderData?.username || 'Usuario';
            m.reply_to = {
              content: reply.content,
              image_url: reply.image_url,
              sender: { username, fullname: senderData?.fullname ?? null },
            };
          }
        }
      });
    }

    // Resolver en lote todas las imágenes privadas de chat (storage://chat-images/...)
    const urlsToResolve: Array<string | null | undefined> = [];
    for (const m of messages) {
      if (m.image_url) urlsToResolve.push(m.image_url);
      if (m.reply_to?.image_url) urlsToResolve.push(m.reply_to.image_url);
    }

    const signedMap = await this.resolveChatImageUrls(urlsToResolve);
    if (signedMap.size > 0) {
      for (const m of messages) {
        if (m.image_url && signedMap.has(m.image_url)) {
          m.image_url = signedMap.get(m.image_url) || null;
        }
        if (m.reply_to?.image_url && signedMap.has(m.reply_to.image_url)) {
          m.reply_to.image_url = signedMap.get(m.reply_to.image_url) || null;
        }
      }
    }

    const hasMore = messages.length >= limit;
    return { messages, hasMore };
  },

  async send(params: {
    conversationId: string;
    senderId: string;
    content?: string | null;
    imageUrl?: string | null;
    replyToId?: string | null;
  }): Promise<any> {
    const { conversationId, senderId, content, imageUrl, replyToId } = params;

    let storedImageUrl = imageUrl ?? null;
    let displayImageUrl = storedImageUrl;

    if (storedImageUrl && isLocalFileUri(storedImageUrl)) {
      storedImageUrl = await this.uploadChatImage(
        conversationId,
        senderId,
        storedImageUrl
      );
      displayImageUrl =
        (await this.resolveChatImageUrl(storedImageUrl)) || storedImageUrl;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content ?? null,
        image_url: storedImageUrl,
        reply_to_id: replyToId ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      image_url: displayImageUrl,
    };
  },

  async delete(messageId: string, senderId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', senderId);
    if (error) throw error;
  },
};
