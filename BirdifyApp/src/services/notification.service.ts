import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export class NotificationService {
  static async register() {
    if (Constants.appOwnership === 'expo') {
      console.log('Push notifications no disponibles en Expo Go');
      return null;
    }
    if (!Device.isDevice) {
      console.log('Debes usar un dispositivo físico');
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permiso denegado');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        'default',
        {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        }
      );
    }

    return tokenData.data;
  }
}