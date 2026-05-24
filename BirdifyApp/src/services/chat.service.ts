import { supabase } from '../lib/supabase';

//Obtener hilos del usuario
export async function getThreads(userId: string) {
  const { data, error } = await supabase
    .from('conversation_members')
    .select(`
      conversation_id,
      conversations (
        id, name, is_group, avatar_url, created_at,
        messages ( content, created_at, sender_id )
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data ?? [];
}

//Obtener o crear conversación directa entre dos usuarios
export async function getOrCreateDirectConversation(
  userA: string,
  userB: string
): Promise<string> {
  // 1. Buscar conversaciones donde userA es miembro
  const { data: membershipsA } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userA);

  if (membershipsA && membershipsA.length > 0) {
    const idsA = membershipsA.map((r: any) => r.conversation_id);

    // 2. De esas, buscar una donde userB también sea miembro
    const { data: shared } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userB)
      .in('conversation_id', idsA);

    if (shared && shared.length > 0) {
      const sharedIds = shared.map((r: any) => r.conversation_id);

      // 3. Verificar que sea directa (no grupo)
      const { data: directConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('is_group', false)
        .in('id', sharedIds)
        .limit(1)
        .single();

      if (directConv) return directConv.id;
    }
  }

  // 4. No existe — crearla en Supabase
  const { data: newConv, error: convError } = await supabase
    .from('conversations')
    .insert({ is_group: false })
    .select()
    .single();

  if (convError || !newConv) throw convError;

  const { error: membersError } = await supabase
    .from('conversation_members')
    .insert([
      { conversation_id: newConv.id, user_id: userA },
      { conversation_id: newConv.id, user_id: userB },
    ]);

  if (membersError) throw membersError;
  return newConv.id;
}

//Obtener mensajes de una conversación
export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, content, image_url, created_at, sender_id, reply_to_id,
      profiles ( username, avatar_url )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

//Enviar mensaje de texto
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

//Enviar imagen
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

  const { data: { publicUrl } } = supabase.storage
    .from('chat-images')
    .getPublicUrl(filename);

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

//Crear grupo
export async function createGroup(
  creatorId: string,
  name: string,
  description: string,
  memberIds: string[],
  avatarUrl?: string
) {
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .insert({
      name,
      description,
      is_group: true,
      created_by: creatorId,
      avatar_url: avatarUrl ?? null,
    })
    .select()
    .single();

  if (convError) throw convError;

  const allMembers = [...new Set([creatorId, ...memberIds])].map(user_id => ({
    conversation_id: conv.id,
    user_id,
  }));

  const { error: membersError } = await supabase
    .from('conversation_members')
    .insert(allMembers);

  if (membersError) throw membersError;
  return conv;
}

//Subir foto de grupo
export async function uploadGroupAvatar(imageUri: string): Promise<string> {
  const filename = `groups/${Date.now()}.jpg`;
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('chat-images')
    .upload(filename, blob, { contentType: 'image/jpeg' });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('chat-images')
    .getPublicUrl(filename);

  return publicUrl;
}

//Suscripción en tiempo real
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
    .subscribe();
}