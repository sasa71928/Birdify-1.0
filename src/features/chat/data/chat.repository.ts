import { supabase } from '../../../lib/supabase';
import {
  compressImage,
  decodeBase64ToArrayBuffer,
  CompressedImageResult,
} from '../../../utils/imageCompressor';
import { ChatBootstrap, ChatMessage } from '../types';
import { resolveChatImageUrl, signedUrlCache } from './signedUrlCache';

const CHAT_IMAGES_BUCKET = 'chat-images';
const CHAT_IMAGE_PREFIX = 'storage://chat-images/';

export interface SendMessageParams {
  id: string; // uuid v4 generado en cliente
  conversationId: string;
  senderId: string;
  text?: string | null;
  localImageUri?: string | null;
  replyToId?: string | null;
}

async function uploadChatImageToStorage(
  conversationId: string,
  senderId: string,
  compressed: CompressedImageResult
): Promise<string> {
  const fileExt = 'jpg';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 6);

  // Variantes de rutas:
  // 1. `${senderId}/${conversationId}_${timestamp}.jpg` (cumple con políticas basadas en auth.uid())
  // 2. `${conversationId}/${senderId}_${timestamp}.jpg` (cumple con políticas basadas en conversation_id)
  const candidatePaths = [
    `${senderId}/${conversationId}_${timestamp}_${randomSuffix}.${fileExt}`,
    `${conversationId}/${senderId}_${timestamp}_${randomSuffix}.${fileExt}`,
  ];

  const candidateBuckets = ['chat-images', 'group-avatars', 'Sightings'];
  let lastError: any = null;

  for (const bucket of candidateBuckets) {
    for (const path of candidatePaths) {
      try {
        // Método 1: ArrayBuffer decodificado de base64 (sin depender de fetch a file://)
        if (compressed.base64) {
          const arrayBuffer = decodeBase64ToArrayBuffer(compressed.base64);
          const { error: abError } = await supabase.storage
            .from(bucket)
            .upload(path, arrayBuffer, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (!abError) {
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
            if (publicUrl) return publicUrl;
          } else {
            lastError = abError;
          }
        }

        // Método 2: FormData con URI local
        const formData = new FormData();
        formData.append('file', {
          uri: compressed.uri,
          name: path.split('/').pop() || 'photo.jpg',
          type: 'image/jpeg',
        } as any);

        const { error: fdError } = await supabase.storage
          .from(bucket)
          .upload(path, formData, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!fdError) {
          const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
          if (publicUrl) return publicUrl;
        } else {
          lastError = fdError;
        }
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw new Error(`Error uploading image: ${lastError?.message || 'Error de almacenamiento'}`);
}

export const ChatRepository = {
  /**
   * Obtiene la metadata inicial de una conversación en un solo viaje
   */
  async bootstrap(conversationId: string): Promise<ChatBootstrap> {
    const { data, error } = await supabase.rpc('get_chat_bootstrap', {
      p_conversation_id: conversationId,
    });

    if (!error && data) {
      return {
        conversation: data.conversation,
        members: data.members || [],
        myRole: data.my_role || 'member',
        otherUserId: data.other_user_id || null,
        lastReadMessageId: data.last_read_message_id || null,
        unreadCount: Number(data.unread_count || 0),
        firstUnreadMessageId: data.first_unread_message_id || null,
        blockedByMe: Boolean(data.blocked_by_me),
        blockedMe: Boolean(data.blocked_me),
      };
    }

    // Fallback de seguridad si la RPC 07 aún no se ha ejecutado en Supabase
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select(`
        id, name, description, avatar_url, is_group, created_by, created_at,
        members:conversation_members (
          user_id, role,
          users (id, username, fullname, profile_pic_url)
        )
      `)
      .eq('id', conversationId)
      .single();

    if (convError || !conv) throw convError || new Error('Conversation not found');

    const { data: { user } } = await supabase.auth.getUser();
    const myId = user?.id || '';

    const members = (conv.members || []).map((m: any) => {
      const u = Array.isArray(m.users) ? m.users[0] : m.users;
      return {
        id: u?.id || m.user_id,
        username: u?.username || 'user',
        fullname: u?.fullname || null,
        profile_pic_url: u?.profile_pic_url || null,
        role: (m.role as 'admin' | 'member') || 'member',
      };
    });

    const myMember = members.find((m) => m.id === myId);
    const otherMember = members.find((m) => m.id !== myId);

    const { data: stateData } = await supabase
      .from('conversation_member_states')
      .select('last_read_message_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', myId)
      .maybeSingle();

    return {
      conversation: {
        id: conv.id,
        name: conv.name,
        description: conv.description,
        avatar_url: conv.avatar_url,
        is_group: conv.is_group,
        created_by: conv.created_by,
        created_at: conv.created_at,
      },
      members,
      myRole: myMember?.role || 'member',
      otherUserId: conv.is_group ? null : (otherMember?.id || null),
      lastReadMessageId: stateData?.last_read_message_id || null,
      unreadCount: 0,
      firstUnreadMessageId: null,
      blockedByMe: false,
      blockedMe: false,
    };
  },

  /**
   * Obtiene una página de mensajes keyset (created_at DESC, id DESC)
   */
  async fetchMessagesPage(
    conversationId: string,
    options?: {
      beforeCreatedAt?: string | null;
      beforeId?: string | null;
      limit?: number;
    }
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    const limit = options?.limit || 50;

    const { data: rpcRows, error: rpcError } = await supabase.rpc(
      'get_conversation_messages',
      {
        p_conversation_id: conversationId,
        p_before_created_at: options?.beforeCreatedAt || null,
        p_before_id: options?.beforeId || null,
        p_limit: limit,
      }
    );

    let rawMessages: any[] = [];
    if (!rpcError && Array.isArray(rpcRows)) {
      rawMessages = rpcRows;
    } else {
      // Fallback a consulta tradicional si la RPC no estuviese aún disponible
      let query = supabase
        .from('messages')
        .select(`
          id, conversation_id, sender_id, content, image_url, reply_to_id, created_at, is_deleted,
          sender:users (id, username, fullname, profile_pic_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (options?.beforeCreatedAt) {
        query = query.lt('created_at', options.beforeCreatedAt);
      }

      const { data, error } = await query;
      if (error) throw error;
      rawMessages = (data || []).reverse();
    }

    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    const messages: ChatMessage[] = rawMessages.map((r: any) => {
      const senderObj = Array.isArray(r.sender) ? r.sender[0] : r.sender;
      const imageUrl = resolveChatImageUrl(r.image_url);
      const replyImageUrl = resolveChatImageUrl(r.reply_to?.image_url);

      const isMine = r.sender_id === currentUserId;

      return {
        id: r.id,
        conversationId: r.conversation_id,
        senderId: r.sender_id,
        text: r.is_deleted ? null : r.content || null,
        imagePath: r.is_deleted ? null : imageUrl,
        imageWidth: r.image_width || null,
        imageHeight: r.image_height || null,
        createdAt: r.created_at,
        isDeleted: Boolean(r.is_deleted),
        sender: senderObj
          ? {
              id: senderObj.id,
              username: senderObj.username || 'user',
              fullname: senderObj.fullname || null,
              profile_pic_url: senderObj.profile_pic_url || null,
            }
          : undefined,
        replyTo: r.reply_to
          ? {
              id: r.reply_to.id || r.reply_to_id,
              text: r.reply_to.content || null,
              imagePath: replyImageUrl,
              senderName: r.reply_to.sender_name || 'Usuario',
            }
          : undefined,
        reactions: Array.isArray(r.reactions) ? r.reactions : [],
        status: isMine ? 'sent' : 'read',
      };
    });

    const hasMore = rawMessages.length >= limit;
    return { messages, hasMore };
  },

  /**
   * Envía un mensaje optimista con compresión automática de imagen
   */
  async sendMessage(params: SendMessageParams): Promise<ChatMessage> {
    const { id, conversationId, senderId, text, localImageUri, replyToId } = params;

    let storedImageUrl: string | null = null;
    let imageWidth: number | null = null;
    let imageHeight: number | null = null;
    let resolvedSignedUrl: string | null = null;

    if (localImageUri) {
      // 1. Redimensionar y comprimir usando el algoritmo unificado de compresión
      const compressed = await compressImage(localImageUri, 'chat');

      imageWidth = compressed.width;
      imageHeight = compressed.height;

      // 2. Subir imagen a Supabase Storage con soporte para base64 y FormData
      const publicUrl = await uploadChatImageToStorage(conversationId, senderId, compressed);

      storedImageUrl = publicUrl;
      resolvedSignedUrl = publicUrl;
    }

    // 3. Insertar mensaje en la BD
    const insertPayload: any = {
      id,
      conversation_id: conversationId,
      sender_id: senderId,
      content: text ? text.trim() : null,
      image_url: storedImageUrl,
      reply_to_id: replyToId || null,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(insertPayload)
      .select('id, conversation_id, sender_id, content, image_url, reply_to_id, created_at')
      .single();

    if (error) throw error;

    const displayUrl = resolvedSignedUrl || storedImageUrl || null;

    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      text: data.content,
      imagePath: displayUrl,
      imageWidth,
      imageHeight,
      createdAt: data.created_at,
      isDeleted: false,
      reactions: [],
      status: 'sent',
    };
  },

  /**
   * Elimina mensaje solo para el usuario actual (append a deleted_for)
   */
  async deleteForMe(messageId: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc('append_deleted_for', {
      message_id: messageId,
      user_id_to_add: userId,
    });
    if (error) {
      // Fallback update
      await supabase
        .from('messages')
        .update({ deleted_for: [userId] })
        .eq('id', messageId);
    }
  },

  /**
   * Elimina mensaje para todos (tombstone)
   */
  async deleteForEveryone(messageId: string): Promise<void> {
    const { error } = await supabase.rpc('delete_message_for_everyone', {
      p_message_id: messageId,
    });
    if (error) {
      await supabase
        .from('messages')
        .update({ is_deleted: true, content: null, image_url: null })
        .eq('id', messageId);
    }
  },

  /**
   * Reacciona o retira reacción
   */
  async toggleReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    // Buscar si ya existe reacción
    const { data } = await supabase
      .from('message_reactions')
      .select('emoji')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .maybeSingle();

    if (data && data.emoji === emoji) {
      // Misma reacción: eliminar
      await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId);
    } else {
      // Distinta o nueva: upsert
      await supabase.from('message_reactions').upsert({
        message_id: messageId,
        user_id: userId,
        emoji,
      });
    }
  },

  /**
   * Marca conversación como leída
   */
  async markAsRead(conversationId: string, userId: string, lastMessageId: string): Promise<void> {
    await supabase.from('conversation_member_states').upsert(
      {
        conversation_id: conversationId,
        user_id: userId,
        last_read_message_id: lastMessageId,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: 'conversation_id, user_id' }
    );
  },

  /**
   * Obtiene todas las fotos compartidas en una conversación
   */
  async getSharedPhotos(
    conversationId: string
  ): Promise<Array<{ id: string; url: string; createdAt: string }>> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, image_path, created_at')
        .eq('conversation_id', conversationId)
        .not('image_path', 'is', null)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data
        .filter((d: any) => Boolean(d.image_path))
        .map((d: any) => ({
          id: d.id,
          url: resolveChatImageUrl(d.image_path) || d.image_path,
          createdAt: d.created_at,
        }));
    } catch (e) {
      console.warn('[ChatRepository] Error getting shared photos:', e);
      return [];
    }
  },
};

