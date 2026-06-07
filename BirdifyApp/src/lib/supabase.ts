import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SERVER_URL = '@birdify_server_url';

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

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const defaultUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

// Cliente mutable: se recrea cuando el usuario cambia la IP del servidor
let _supabase: SupabaseClient = createClient(defaultUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Proxy que siempre delega al client interno actual.
 * Todos los imports existentes (`import { supabase } from '...'`) siguen funcionando
 * porque este proxy reenvía cualquier acceso de propiedad al client real.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(_supabase, prop, _supabase);
  },
});

/**
 * Lee la URL del servidor guardada en AsyncStorage.
 * Devuelve la URL guardada, o la URL por defecto del .env si no hay ninguna.
 */
export async function getServerUrl(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_SERVER_URL);
    return saved || defaultUrl;
  } catch {
    return defaultUrl;
  }
}

/**
 * Guarda una nueva URL de servidor y recrea el client de Supabase.
 * Esto permite cambiar la IP sin recompilar el APK.
 */
export async function setServerUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_SERVER_URL, url);
  _supabase = createClient(url, supabaseAnonKey, {
    auth: {
      storage: safeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Inicializa el client de Supabase con la URL guardada en AsyncStorage.
 * Debe llamarse una vez al inicio de la app (antes del primer render).
 */
export async function initSupabaseClient(): Promise<void> {
  const url = await getServerUrl();
  if (url && url !== defaultUrl) {
    _supabase = createClient(url, supabaseAnonKey, {
      auth: {
        storage: safeStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
}
