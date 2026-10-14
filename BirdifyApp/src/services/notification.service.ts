import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { isRunningInExpoGo } from 'expo';

// Cargar expo-notifications dinámicamente SOLO fuera de Expo Go.
// En Expo SDK 53+, simplemente importar 'expo-notifications' en Expo Go
// en Android lanza un error fatal en tiempo de inicio ("Runtime not ready").
let NotificationsModule: typeof import('expo-notifications') | null = null;

function getNotificationsModule() {
  if (isRunningInExpoGo()) {
    return null;
  }
  if (!NotificationsModule) {
    try {
      NotificationsModule = require('expo-notifications');
      NotificationsModule?.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (e) {
      console.warn('[NotificationService] No se pudo cargar expo-notifications:', e);
    }
  }
  return NotificationsModule;
}

export class NotificationService {
  static async register(): Promise<string | null> {
    try {
      if (isRunningInExpoGo()) {
        console.log('[NotificationService] Push notifications no están soportadas en Expo Go (removidas en SDK 53+).');
        return null;
      }

      const Notifications = getNotificationsModule();
      if (!Notifications) {
        return null;
      }

      if (!Device.isDevice) {
        console.log('Debes usar un dispositivo físico para notificaciones push');
        return null;
      }

      // Crear canal de notificación PRIMERO en Android (evita crash en standalone)
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync(
            'default',
            {
              name: 'default',
              importance: Notifications.AndroidImportance.MAX,
            }
          );
        } catch (channelError) {
          console.warn('Error creando canal de notificacion:', channelError);
        }
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        try {
          const { status } =
            await Notifications.requestPermissionsAsync();
          finalStatus = status;
        } catch (permError) {
          console.warn('Error solicitando permisos de notificacion:', permError);
          return null;
        }
      }

      if (finalStatus !== 'granted') {
        console.log('Permiso denegado');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );
      return tokenData.data ?? null;
    } catch (error) {
      console.warn('[NotificationService] No se pudo registrar push notifications:', error);
      return null;
    }
  }
}