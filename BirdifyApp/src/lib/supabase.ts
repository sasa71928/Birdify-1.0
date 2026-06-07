import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Adaptador robusto para AsyncStorage que hace fallback a memoria por-operación sin desactivar almacenamiento permanente
const safeStorage = {
  fallback: new Map<string, string>(),

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e: any) {
      return this.fallback.get(key) || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e: any) {
      this.fallback.set(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e: any) {
      this.fallback.delete(key);
    }
  }
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase: Faltan variables de entorno. Verifica tu archivo .env');
}

// Inicialización simple pero potente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage, // Tu adaptador robusto
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
