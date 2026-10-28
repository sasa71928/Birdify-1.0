import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

/**
 * Adaptador seguro para Supabase Auth:
 * - En plataformas nativas (iOS / Android) utiliza SecureStore respaldado por Keychain / Keystore con cifrado AES-256.
 * - En web o como fallback ante fallos de hardware, usa AsyncStorage con respaldo en memoria.
 */
const secureStorage = {
  memoryFallback: new Map<string, string>(),

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS !== 'web') {
        const value = await SecureStore.getItemAsync(key);
        if (value !== null) return value;
      }
      return await AsyncStorage.getItem(key);
    } catch {
      return this.memoryFallback.get(key) || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch {
      try {
        await AsyncStorage.setItem(key, value);
      } catch {
        this.memoryFallback.set(key, value);
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(key);
      }
      await AsyncStorage.removeItem(key);
    } catch {
      this.memoryFallback.delete(key);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Variables de entorno de Supabase no configuradas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
