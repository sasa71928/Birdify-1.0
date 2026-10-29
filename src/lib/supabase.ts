import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const CHUNK_PREFIX = '__CHUNKED__:';
const CHUNK_SIZE = 1800; // Seguro por debajo del límite de 2048 bytes por entrada en Keychain/Keystore

let shouldPersistToDisk = true;

/**
 * Permite controlar si la sesión de inicio de sesión actual debe persistirse en Keychain/Keystore
 * o mantenerse únicamente en memoria volátil cuando el usuario desmarca "Recordarme" (AUD-026).
 */
export function setSessionPersistence(persist: boolean): void {
  shouldPersistToDisk = persist;
}

function chunkKey(key: string, index: number): string {
  return `${key}__chunk_${index}`;
}

async function clearSecureChunks(key: string): Promise<void> {
  try {
    const header = await SecureStore.getItemAsync(key);
    if (header && header.startsWith(CHUNK_PREFIX)) {
      const count = parseInt(header.slice(CHUNK_PREFIX.length), 10);
      if (!Number.isNaN(count) && count > 0) {
        await Promise.all(
          Array.from({ length: count }, (_, i) =>
            SecureStore.deleteItemAsync(chunkKey(key, i)).catch(() => {})
          )
        );
      }
    }
  } catch {
    // Ignorar errores al limpiar fragmentos previos
  }
}

/**
 * Adaptador seguro para Supabase Auth (OWASP MASVS-STORAGE-1):
 * - En iOS y Android fragmenta sesiones grandes (> 1.8 KB, ej. OAuth Google/Facebook)
 *   dentro de SecureStore (Keychain / Android Keystore AES-256) sin caer jamás en AsyncStorage en texto plano.
 * - Migra de forma transparente cualquier sesión previa en AsyncStorage y la borra inmediatamente del disco sin cifrar.
 * - En Web utiliza AsyncStorage (o RAM si shouldPersistToDisk es false).
 */
const secureStorage = {
  memoryFallback: new Map<string, string>(),

  async getItem(key: string): Promise<string | null> {
    if (this.memoryFallback.has(key)) {
      return this.memoryFallback.get(key) || null;
    }

    if (Platform.OS === 'web') {
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    }

    try {
      const raw = await SecureStore.getItemAsync(key);
      if (raw !== null) {
        if (raw.startsWith(CHUNK_PREFIX)) {
          const count = parseInt(raw.slice(CHUNK_PREFIX.length), 10);
          if (Number.isNaN(count) || count <= 0) return null;
          const parts = await Promise.all(
            Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(chunkKey(key, i)))
          );
          if (parts.some((p) => p === null)) return null;
          return parts.join('');
        }
        return raw;
      }

      // Migración única de sesiones antiguas que hubieran caído en AsyncStorage (> 2 KB)
      const legacyPlaintext = await AsyncStorage.getItem(key);
      if (legacyPlaintext !== null) {
        await this.setItem(key, legacyPlaintext);
        await AsyncStorage.removeItem(key).catch(() => {});
        return legacyPlaintext;
      }

      return null;
    } catch {
      return this.memoryFallback.get(key) || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (!shouldPersistToDisk) {
      this.memoryFallback.set(key, value);
      try {
        if (Platform.OS !== 'web') {
          await clearSecureChunks(key);
          await SecureStore.deleteItemAsync(key).catch(() => {});
        }
        await AsyncStorage.removeItem(key).catch(() => {});
      } catch {
        // Ignorar errores al limpiar disco
      }
      return;
    }

    if (Platform.OS === 'web') {
      try {
        await AsyncStorage.setItem(key, value);
        this.memoryFallback.delete(key);
      } catch {
        this.memoryFallback.set(key, value);
      }
      return;
    }

    try {
      await clearSecureChunks(key);

      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
      } else {
        const chunks: string[] = [];
        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
          chunks.push(value.slice(i, i + CHUNK_SIZE));
        }
        await Promise.all(
          chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(key, index), chunk))
        );
        await SecureStore.setItemAsync(key, `${CHUNK_PREFIX}${chunks.length}`);
      }

      this.memoryFallback.delete(key);
      await AsyncStorage.removeItem(key).catch(() => {});
    } catch {
      // Respaldo exclusivamente en RAM volátil (nunca en AsyncStorage sin cifrar)
      this.memoryFallback.set(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    this.memoryFallback.delete(key);
    shouldPersistToDisk = true;
    try {
      if (Platform.OS !== 'web') {
        await clearSecureChunks(key);
        await SecureStore.deleteItemAsync(key);
      }
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignorar errores al limpiar sesión
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
