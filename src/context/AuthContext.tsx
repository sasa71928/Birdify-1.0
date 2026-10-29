import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { NotificationService } from '../services/notification.service';
import { parseAuthParams } from '../services/auth.service';
import NetInfo from '@react-native-community/netinfo';
import { clearLocalData } from '../services/syncService';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  completePasswordRecovery: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  isPasswordRecovery: false,
  completePasswordRecovery: () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const handledRecoveryUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      registerPush(user.id);
    }
  }, [user]);

  const registerPush = async (userId: string) => {
    try {
      const token = await NotificationService.register();

      if (!token) return;

      await supabase
        .from('users')
        .update({
          expo_push_token: token,
        })
        .eq('id', userId);
    } catch (e) {
      console.error('Error registering push token:', e);
    }
  };

  const signOut = async () => {
    const currentUserId = user?.id;
    try {
      // Desvincular expo_push_token antes de invalidar el JWT para evitar envíos push tras cerrar sesión (AUD-008)
      if (currentUserId) {
        const netState = await NetInfo.fetch();
        if (netState.isConnected) {
          await supabase
            .from('users')
            .update({ expo_push_token: null })
            .eq('id', currentUserId);
        }
      }
    } catch {
      // No bloquear cierre de sesión si falla la red
    }

    try {
      await supabase.auth.signOut();
    } finally {
      await clearLocalData();
      setIsPasswordRecovery(false);
      setUser(null);
      setSession(null);
    }
  };

  const ensurePublicProfile = async (authUser: User) => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return;
    try {
      const { data: existing, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking public user profile:', error);
        return;
      }

      // Si no existe el perfil bajo este ID, lo creamos/sincronizamos
      if (!existing) {
        const meta = authUser.user_metadata || {};
        // Registro por email usa username/fullname/profile_pic_url;
        // Google/Facebook envían full_name/name y avatar_url/picture.
        const rawUsername = meta.username || authUser.email?.split('@')[0] || `user_${authUser.id.substring(0, 8)}`;
        const fullname = meta.fullname || meta.full_name || meta.name || null;
        const profilePicUrl = meta.profile_pic_url || meta.avatar_url || meta.picture || 'https://gravatar.com/avatar/?d=mp';

        // Sanitize username to match alphanumeric + underscores
        const sanitizedUsername =
          rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '') || `user_${authUser.id.substring(0, 8)}`;

        const upsertProfile = (username: string) =>
          supabase
            .from('users')
            .upsert(
              {
                id: authUser.id,
                email: authUser.email,
                username,
                fullname: fullname,
                profile_pic_url: profilePicUrl,
              },
              { onConflict: 'id' }
            );

        let { error: upsertError } = await upsertProfile(sanitizedUsername);

        // Si el username ya está en uso (p.ej. dos cuentas Gmail con el mismo prefijo), añadimos sufijo
        if (upsertError?.code === '23505' && /username/i.test(upsertError.message + (upsertError.details ?? ''))) {
          ({ error: upsertError } = await upsertProfile(
            `${sanitizedUsername.substring(0, 20)}_${authUser.id.substring(0, 6)}`
          ));
        }

        if (upsertError) {
          console.error('Error ensuring public user profile:', upsertError);
        } else {
          console.log('Public user profile successfully synchronized.');
        }
      }
    } catch (err) {
      console.error('Exception ensuring public user profile:', err);
    }
  };

  useEffect(() => {
    const handleRecoveryDeepLink = async (url: string | null) => {
      if (!url || handledRecoveryUrlsRef.current.has(url)) return;

      const params = parseAuthParams(url);
      const isRecoveryPath = url.includes('auth/reset-password') || params.type === 'recovery';
      if (!isRecoveryPath) return;

      handledRecoveryUrlsRef.current.add(url);

      try {
        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (!error) {
            setIsPasswordRecovery(true);
          }
        } else if (params.access_token && params.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (!error) {
            setIsPasswordRecovery(true);
          }
        }
      } catch (err) {
        console.error('Error processing password recovery link:', err);
      }
    };

    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        ensurePublicProfile(initialSession.user);
      }
      setIsLoading(false);
    });

    // Capturar enlace profundo inicial y suscribirse a enlaces entrantes de recuperación (AUD-016)
    Linking.getInitialURL().then(handleRecoveryDeepLink).catch(() => {});
    const linkSub = Linking.addEventListener('url', ({ url }) => {
      handleRecoveryDeepLink(url);
    });

    // Escuchar cambios de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      if (nextSession?.user) {
        ensurePublicProfile(nextSession.user);
      }
    });

    return () => {
      linkSub.remove();
      subscription.unsubscribe();
    };
  }, []);

  const completePasswordRecovery = () => {
    setIsPasswordRecovery(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isPasswordRecovery,
        completePasswordRecovery,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
