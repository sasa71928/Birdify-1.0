import { supabase } from '../lib/supabase';
import { PushNotificationSender } from '../services/push.sender';
import { NotificationPreferencesService } from '../services/notification.preferences';

export const CommentRepository = {
  // Crear un comentario o respuesta (subcomentario)
  async create(sightingId: string, userId: string, content: string, parentCommentId: string | null = null): Promise<any> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        sighting_id: sightingId,
        user_id: userId,
        content: content,
        parent_comment_id: parentCommentId,
        is_subcomment: !!parentCommentId
      })
      .select(`
        *,
        users!comments_user_id_fkey (username)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      throw error;
    }

    // Notificar al owner del sighting
    this.notifyOwner(sightingId, userId, content).catch(() => {});

    return data;
  },

  async notifyOwner(sightingId: string, commenterId: string, content: string): Promise<void> {
    try {
      // Obtener owner del sighting
      const { data: sighting } = await supabase
        .from('sightings')
        .select('user_id')
        .eq('id', sightingId)
        .single();

      if (!sighting || sighting.user_id === commenterId) return;

      const ownerId = sighting.user_id;
      const isEnabled = await NotificationPreferencesService.isPushEnabled(ownerId, 'new_comment');
      if (!isEnabled) return;

      const token = await NotificationPreferencesService.getPushToken(ownerId);
      if (!token) return;

      await PushNotificationSender.send({
        to: token,
        sound: 'default',
        title: 'Nuevo comentario',
        body: content.length > 60 ? content.substring(0, 60) + '...' : content,
        data: { type: 'new_comment', sightingId },
      });
    } catch (e) {
      console.error('Error notifying comment owner:', e);
    }
  },

  // Obtener todos los comentarios de un avistamiento en un árbol jerárquico
  async getBySightingId(sightingId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users!comments_user_id_fkey (username)
      `)
      .eq('sighting_id', sightingId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    const comments = data || [];
    
    // Filtramos comentarios principales (sin padre) y respuestas
    const mainComments = comments.filter(c => !c.parent_comment_id);
    const subComments = comments.filter(c => c.parent_comment_id);

    return mainComments.map(main => {
      const replies = subComments
        .filter(sub => sub.parent_comment_id === main.id)
        .map(sub => ({
          id: sub.id,
          userId: sub.user_id,
          username: sub.users?.username || 'Usuario',
          text: sub.content
        }));

      return {
        id: main.id,
        userId: main.user_id,
        username: main.users?.username || 'Usuario',
        text: main.content,
        replies
      };
    });
  }
};
