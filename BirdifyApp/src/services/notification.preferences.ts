import { supabase } from '../lib/supabase';

type NotificationType = 'new_sighting' | 'new_comment' | 'new_follower' | 'direct_message' | 'weekly_digest' | 'account_security';

const TYPE_ID_MAP: Record<NotificationType, string> = {
  new_sighting: '1',
  new_comment: '2',
  new_follower: '3',
  direct_message: '4',
  weekly_digest: '5',
  account_security: '6',
};

export class NotificationPreferencesService {
  static async isPushEnabled(userId: string, type: NotificationType): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('push_notifications')
        .eq('id', userId)
        .single();

      if (error || !data?.push_notifications) return false;

      const settings = Array.isArray(data.push_notifications) ? data.push_notifications : [];
      const item = settings.find((s: any) => s.id === TYPE_ID_MAP[type]);
      return !!item?.active;
    } catch {
      return false;
    }
  }

  static async isEmailEnabled(userId: string, type: NotificationType): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email_notifications')
        .eq('id', userId)
        .single();

      if (error || !data?.email_notifications) return false;

      const settings = Array.isArray(data.email_notifications) ? data.email_notifications : [];
      const item = settings.find((s: any) => s.id === TYPE_ID_MAP[type]);
      return !!item?.active;
    } catch {
      return false;
    }
  }

  static async getPushToken(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('expo_push_token')
        .eq('id', userId)
        .single();

      if (error) return null;
      return data?.expo_push_token || null;
    } catch {
      return null;
    }
  }
}
