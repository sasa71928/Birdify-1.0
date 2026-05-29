import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export class NotificationService {
  static async register(): Promise<string | null> {
    try {
      if (Constants.appOwnership === 'expo') {
        console.log('Push notifications no disponibles en Expo Go');
        return null;
      }
      if (!Device.isDevice) {
        console.log('Debes usar un dispositivo físico');
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
      console.error('Error en NotificationService.register:', error);
      return null;
    }
  }
}