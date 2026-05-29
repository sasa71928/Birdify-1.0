import { supabase } from '../lib/supabase';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_ACCESS_TOKEN = process.env.EXPO_PUBLIC_EXPO_ACCESS_TOKEN;

interface PushMessage {
  to: string;
  sound?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

export class PushNotificationSender {
  static async send(message: PushMessage): Promise<void> {
    if (!EXPO_ACCESS_TOKEN) {
      console.warn('[PushNotificationSender] EXPO_PUBLIC_EXPO_ACCESS_TOKEN no está configurado. No se pueden enviar push notifications.');
      return;
    }

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${EXPO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(message),
      });

      const data = await response.json();

      if (data?.data?.status === 'error') {
        console.error('[PushNotificationSender] Error enviando notificación:', data);
      }
    } catch (error) {
      console.error('[PushNotificationSender] Error de red:', error);
    }
  }

  static async sendToUsers(
    userIds: string[],
    payload: { title: string; body: string; data?: Record<string, any> }
  ): Promise<void> {
    if (!EXPO_ACCESS_TOKEN || userIds.length === 0) return;

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, expo_push_token')
        .in('id', userIds)
        .not('expo_push_token', 'is', null);

      if (error || !users || users.length === 0) return;

      const messages: PushMessage[] = users
        .filter((u: any) => u.expo_push_token)
        .map((u: any) => ({
          to: u.expo_push_token,
          sound: 'default',
          title: payload.title,
          body: payload.body,
          data: payload.data,
        }));

      if (messages.length === 0) return;

      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${EXPO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(messages),
      });

      const data = await response.json();
      if (data?.errors) {
        console.error('[PushNotificationSender] Errores en batch:', data.errors);
      }
    } catch (error) {
      console.error('[PushNotificationSender] Error de red en batch:', error);
    }
  }
}
