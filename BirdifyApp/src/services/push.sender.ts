/**
 * PushNotificationSender
 *
 * NOTA DE SEGURIDAD (Migración C2 / A5):
 * El despacho de notificaciones push ahora se realiza de forma segura y centralizada
 * a través de triggers de base de datos en Supabase (pg_net) ejecutados por el servidor.
 * Ver docs/migrations/01_push_triggers_pg_net.sql.
 *
 * Esta clase se mantiene como interfaz segura sin emisión directa desde cliente,
 * evitando la exposición de tokens maestros de Expo en el bundle móvil.
 */

interface PushMessage {
  to: string;
  sound?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

export class PushNotificationSender {
  static async send(_message: PushMessage): Promise<void> {
    // Las notificaciones son despachadas automáticamente por triggers en base de datos.
    return;
  }

  static async sendToUsers(
    _userIds: string[],
    _payload: { title: string; body: string; data?: Record<string, any> }
  ): Promise<void> {
    // Las notificaciones son despachadas automáticamente por triggers en base de datos.
    return;
  }
}
