import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import NetInfo from '@react-native-community/netinfo';
import { supabase, setSessionPersistence } from '../lib/supabase';
import { ProfileRepository } from '../repositories/profile.repository';
import { clearLocalData } from './syncService';
import { toAppError } from '../utils/errors';

// Cierra la ventana del navegador si la app se reabre desde el redirect (necesario en web)
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'facebook';

/** Error lanzado cuando el usuario cierra/cancela la ventana de login social. */
export class OAuthCancelledError extends Error {
  constructor() {
    super('Inicio de sesión cancelado.');
    this.name = 'OAuthCancelledError';
  }
}

/** Extrae parámetros tanto del query (?a=b) como del fragment (#a=b) de una URL. */
export function parseAuthParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.includes('?') ? beforeHash.split('?')[1] : '';
  for (const part of [query, hash]) {
    if (!part) continue;
    for (const pair of part.split('&')) {
      const [k, v = ''] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
    }
  }
  return params;
}

const GENERIC_AUTH_ERROR = 'Correo/usuario o contraseña incorrectos.';

export const AuthService = {
  async signIn(emailOrUsername: string, password: string, persistSession = true) {
    try {
      setSessionPersistence(persistSession);
      let email = emailOrUsername.trim();

      // Si el input empieza con '@', lo removemos y asumimos que es un nombre de usuario
      if (email.startsWith('@')) {
        email = email.substring(1).trim();
      }

      // Si no contiene un '@' o no tiene un formato de correo simple, asumimos que es username
      const isEmail = email.includes('@') && email.indexOf('.') > email.indexOf('@');

      if (!isEmail) {
        // Sanitizar username para evitar inyecciones de comodines
        const sanitizedUser = email.replace(/[%,\\]/g, '').trim();
        if (!sanitizedUser) {
          throw new Error(GENERIC_AUTH_ERROR);
        }

        // Resolver email mediante RPC SECURITY DEFINER sin exponer la tabla public.users a anon
        const { data: resolvedEmail, error: rpcError } = await supabase.rpc(
          'resolve_login_email',
          { p_username: sanitizedUser }
        );

        if (rpcError) {
          // Compatibilidad temporal si aún no se aplicó la migración 05 en Supabase
          if (rpcError.code === 'PGRST202') {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('email')
              .ilike('username', sanitizedUser)
              .maybeSingle();

            if (userError) {
              throw new Error('Error de conexión al iniciar sesión. Intenta nuevamente.');
            }
            if (!userData?.email) {
              throw new Error(GENERIC_AUTH_ERROR);
            }
            email = userData.email;
          } else {
            throw new Error('Error de conexión al iniciar sesión. Intenta nuevamente.');
          }
        } else {
          if (!resolvedEmail) {
            // Mensaje idéntico al de contraseña inválida para evitar enumeración de usuarios
            throw new Error(GENERIC_AUTH_ERROR);
          }
          email = resolvedEmail;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (/invalid login credentials/i.test(error.message)) {
          throw new Error(GENERIC_AUTH_ERROR);
        }
        throw error;
      }

      // Intentar obtener el perfil del usuario
      let profile = null;
      try {
        profile = await ProfileRepository.getById(data.user.id);
      } catch {
        console.log('No se pudo cargar el perfil del usuario. Es posible que aún no exista.');
      }

      return { user: data.user, session: data.session, profile };
    } catch (error) {
      throw toAppError(error);
    }
  },

  async signUp(email: string, password: string, username: string, fullname: string) {
    try {
      setSessionPersistence(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            fullname: fullname,
            profile_pic_url: 'https://gravatar.com/avatar/?d=mp',
          },
        },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  },

  /**
   * Registro / inicio de sesión con Google o Facebook mediante Supabase OAuth (PKCE).
   * Si la cuenta no existe, Supabase la crea automáticamente.
   */
  async signInWithOAuth(provider: OAuthProvider) {
    try {
      setSessionPersistence(true);
      // birdify://auth/callback en builds nativos; exp://.../--/auth/callback en Expo Go
      const redirectTo = Linking.createURL('auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          scopes: provider === 'facebook' ? 'email public_profile' : undefined,
          queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error('No se pudo iniciar el login con el proveedor.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type !== 'success') {
        throw new OAuthCancelledError();
      }

      const params = parseAuthParams(result.url);

      if (params.error || params.error_description) {
        throw new Error(params.error_description || params.error);
      }

      let session;
      if (params.code) {
        // Flujo PKCE obligatorio para aplicaciones móviles (RFC 8252)
        const { data: exchanged, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(params.code);
        if (exchangeError) throw exchangeError;
        session = exchanged.session;
      } else {
        throw new Error('Respuesta de autenticación inválida o código de autorización ausente.');
      }

      // El AuthProvider detecta la nueva sesión (onAuthStateChange) y crea el perfil si falta.
      return { user: session?.user ?? null, session };
    } catch (error) {
      if (error instanceof OAuthCancelledError) throw error;
      throw toAppError(error);
    }
  },

  async signOut() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        const netState = await NetInfo.fetch();
        if (netState.isConnected) {
          await supabase
            .from('users')
            .update({ expo_push_token: null })
            .eq('id', userId);
        }
      }
    } catch {
      // Ignorar fallo de red al desvincular token push
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw toAppError(error);
    } finally {
      await clearLocalData();
    }
  },
};
