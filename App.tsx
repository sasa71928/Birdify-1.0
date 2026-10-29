import 'react-native-get-random-values';
import './src/utils/logger';
import React, { useEffect } from 'react';
import { initDatabase } from './src/lib/database';
import { initNetworkListener } from './src/services/syncService';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
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
import { Colors } from './src/theme';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NewSightingsProvider } from './src/context/NewSightingsContext';
import { UnreadMessagesProvider } from './src/context/UnreadMessagesContext';
import { InteractionsProvider } from './src/context/InteractionsContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OfflineProvider } from './src/context/OfflineContext';
import ResetPasswordModal from './src/components/ResetPasswordModal';

const navigationLinking = {
  prefixes: [Linking.createURL('/'), 'birdify://'],
};

function PasswordRecoveryGate() {
  const { isPasswordRecovery, completePasswordRecovery } = useAuth();
  return (
    <ResetPasswordModal
      visible={isPasswordRecovery}
      onComplete={completePasswordRecovery}
    />
  );
}

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
      .then(() => console.log('✅ SQLite listo'))
      .catch(e => console.error('❌ Error al inicializar:', e));

    initNetworkListener();
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
      <OfflineProvider>
        <AuthProvider>
          <ThemeProvider>
            <NewSightingsProvider>
              <UnreadMessagesProvider>
                <NavigationContainer linking={navigationLinking}>
                  <InteractionsProvider>
                    <AppNavigator />
                    <PasswordRecoveryGate />
                  </InteractionsProvider>
                </NavigationContainer>
              </UnreadMessagesProvider>
            </NewSightingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </OfflineProvider>
    </SafeAreaProvider>
  );
}
