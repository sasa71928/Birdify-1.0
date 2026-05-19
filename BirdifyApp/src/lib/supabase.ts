import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Adaptador robusto para AsyncStorage que hace fallback a memoria en caso de error nativo (ej. Web, simulador sin recompilar, etc.)
class SafeAsyncStorage {
  private fallback = new Map<string, string>();
  private useFallback = false;

  async getItem(key: string): Promise<string | null> {
    if (this.useFallback) {
      return this.fallback.get(key) || null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (e: any) {
      if (e?.message?.includes('Native module is null') || e?.message?.includes('cannot access legacy storage')) {
        console.warn('AsyncStorage nativo no disponible. Usando almacenamiento en memoria.');
        this.useFallback = true;
        return this.fallback.get(key) || null;
      }
      throw e;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.useFallback) {
      this.fallback.set(key, value);
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e: any) {
      if (e?.message?.includes('Native module is null') || e?.message?.includes('cannot access legacy storage')) {
        console.warn('AsyncStorage nativo no disponible. Usando almacenamiento en memoria.');
        this.useFallback = true;
        this.fallback.set(key, value);
        return;
      }
      throw e;
    }
  }

  async removeItem(key: string): Promise<void> {
    if (this.useFallback) {
      this.fallback.delete(key);
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (e: any) {
      if (e?.message?.includes('Native module is null') || e?.message?.includes('cannot access legacy storage')) {
        console.warn('AsyncStorage nativo no disponible. Usando almacenamiento en memoria.');
        this.useFallback = true;
        this.fallback.delete(key);
        return;
      }
      throw e;
    }
  }
}

const safeStorage = new SafeAsyncStorage();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
