import { supabase } from '../lib/supabase';

// ── Obtener hilos del usuario ─────────────────────────────────────────────────
export async function getThreads(userId: string) {
  const { data, error } = await supabase
    .from('conversation_members')
    .select(`
      conversation_id,
      conv:conversations (
        id, name, is_group, avatar_url, created_at,
        conversation_members (
          user_id,
          profiles ( id, username, avatar_url )
        )
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;

  const threads = await Promise.all(
    (data ?? []).map(async (item: any) => {
      const conv = item.conv;
      if (!conv) return null;

      const { data: lastMsgArr } = await supabase
        .from('messages')
        .select('content, image_url, created_at, sender_id')
        .eq('conversation_id', conv.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1);

      const last = lastMsgArr?.[0] ?? null;

      let displayName: string = conv.name ?? '';
      let displayAvatar: string = conv.avatar_url ?? '';

      // Para chats directos, mostrar nombre/avatar del otro usuario
      if (!conv.is_group) {
        const other = (conv.conversation_members ?? []).find(
          (m: any) => m.user_id !== userId
        );
        if (other?.profiles) {
          displayName = other.profiles.username ?? 'Usuario';
          displayAvatar = other.profiles.avatar_url ?? '';
        }
      }

      return { ...item, displayName, displayAvatar, lastMsg: last };
    })
  );

  return threads.filter(Boolean);
}

// ── Obtener o crear conversación directa (RPC SECURITY DEFINER) ───────────────
// Usa función SQL para evitar error 42501 de RLS al insertar en conversations
export async function getOrCreateDirectConversation(
  userA: string,
  userB: string
): Promise<string> {
  const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
    user_a: userA,
    user_b: userB,
  });

  if (error) throw error;
  return data as string;
}

// ── Obtener mensajes de una conversación ──────────────────────────────────────
export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, content, image_url, created_at, sender_id,
      reply_to_id, is_deleted, deleted_for,
      profiles ( username, avatar_url )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ── Enviar mensaje de texto ───────────────────────────────────────────────────
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  replyToId?: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      reply_to_id: replyToId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Enviar imagen ─────────────────────────────────────────────────────────────
export async function sendImageMessage(
  conversationId: string,
  senderId: string,
  imageUri: string
) {
  const filename = `chats/${conversationId}/${Date.now()}.jpg`;
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('chat-images')
    .upload(filename, blob, { contentType: 'image/jpeg' });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('chat-images').getPublicUrl(filename);

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      image_url: publicUrl,
      content: '',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Crear grupo (RPC SECURITY DEFINER) ───────────────────────────────────────
// Usa función SQL para evitar error 42501 de RLS al insertar en conversations
export async function createGroup(
  creatorId: string,
  name: string,
  description: string,
  memberIds: string[],
  avatarUrl?: string
) {
  const { data, error } = await supabase.rpc('create_group_conversation', {
    creator_id: creatorId,
    group_name: name,
    group_description: description,
    member_ids: memberIds,
    group_avatar: avatarUrl ?? null,
  });

  if (error) throw error;
  return { id: data as string };
}

// ── Subir foto de grupo ───────────────────────────────────────────────────────
export async function uploadGroupAvatar(imageUri: string): Promise<string> {
  const filename = `groups/${Date.now()}.jpg`;
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('chat-images')
    .upload(filename, blob, { contentType: 'image/jpeg' });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from('chat-images').getPublicUrl(filename);

  return publicUrl;
}

// ── Borrar mensaje solo para mí ───────────────────────────────────────────────
export async function deleteMessageForMe(messageId: string, userId: string) {
  const { error } = await supabase.rpc('append_deleted_for', {
    message_id: messageId,
    user_id_to_add: userId,
  });

  if (error) throw error;
}

// ── Borrar mensaje para todos (solo dentro de 1 hora) ────────────────────────
export async function deleteMessageForEveryone(messageId: string, senderId: string) {
  const { data: msg, error: fetchError } = await supabase
    .from('messages')
    .select('sender_id, created_at')
    .eq('id', messageId)
    .single();

  if (fetchError || !msg) throw new Error('Mensaje no encontrado.');
  if (msg.sender_id !== senderId) throw new Error('Solo puedes borrar tus propios mensajes.');

  const ageMs = Date.now() - new Date(msg.created_at).getTime();
  if (ageMs > 60 * 60 * 1000) {
    throw new Error('Solo puedes borrar mensajes enviados en la última hora.');
  }

  const { error } = await supabase
    .from('messages')
    .update({ is_deleted: true, content: null, image_url: null })
    .eq('id', messageId);

  if (error) throw error;
}

// ── Borrar grupo (solo admin) ─────────────────────────────────────────────────
export async function deleteGroup(conversationId: string, userId: string) {
  const { data: member, error: memberError } = await supabase
    .from('conversation_members')
    .select('role')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .single();

  if (memberError || !member) throw new Error('No perteneces a este grupo.');
  if (member.role !== 'admin') throw new Error('Solo el administrador puede borrar el grupo.');

  const { data: conv } = await supabase
    .from('conversations')
    .select('is_group')
    .eq('id', conversationId)
    .single();

  if (!conv?.is_group) throw new Error('Esta conversación no es un grupo.');

  // Borrar en orden por foreign keys: mensajes → miembros → conversación
  await supabase.from('messages').delete().eq('conversation_id', conversationId);
  await supabase.from('conversation_members').delete().eq('conversation_id', conversationId);

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('is_group', true); // guard: nunca borrar chats directos

  if (error) throw error;
}

// ── Suscripción en tiempo real ────────────────────────────────────────────────
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (msg: any) => void
) {
  return supabase
    .channel(`chat:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onNewMessage(payload.new)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onNewMessage(payload.new)
    )
    .subscribe();
}