import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { initDatabase } from './src/lib/database';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import * as Notifications from 'expo-notifications';
import { Colors } from './src/theme';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { NewSightingsProvider } from './src/context/NewSightingsContext';
import { UnreadMessagesProvider } from './src/context/UnreadMessagesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OfflineProvider } from './src/navigation/AppNavigator';

// Configurar handler de notificaciones antes de que la app monte
// Esto es requerido para que expo-notifications funcione correctamente en Android standalone
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans: PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
    BeVietnamPro: BeVietnamPro_400Regular,
    'BeVietnamPro-Medium': BeVietnamPro_500Medium,
    'BeVietnamPro-SemiBold': BeVietnamPro_600SemiBold,
    'BeVietnamPro-Bold': BeVietnamPro_700Bold,
  });

    useEffect(() => {
    initDatabase()
      .then(() => console.log('✅ SQLite inicializado'))
      .catch(e => console.error('❌ Error al inicializar SQLite:', e));

  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <NewSightingsProvider>
            <UnreadMessagesProvider>
              <OfflineProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </OfflineProvider>
            </UnreadMessagesProvider>
          </NewSightingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
