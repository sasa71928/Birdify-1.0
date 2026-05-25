import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import db from '../lib/database';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

const LAST_USER_ID_KEY = 'birdify:lastUserId';

async function cacheUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return;

    await db.runAsync(
      `INSERT OR REPLACE INTO users (id, email, username, fullname, bio, profile_pic_url, is_private, is_verified, user_level, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.email, data.username, data.fullname ?? null,
        data.bio ?? null, data.profile_pic_url ?? null,
        data.is_private ? 1 : 0, data.is_verified ? 1 : 0,
        data.user_level, data.created_at,
      ]
    );

    await AsyncStorage.setItem(LAST_USER_ID_KEY, data.id);
    console.log('✅ Perfil cacheado localmente');
  } catch (err) {
    console.warn('⚠️ No se pudo cachear el perfil:', err);
  }
}

async function getOfflineUser(): Promise<User | null> {
  try {
    const lastUserId = await AsyncStorage.getItem(LAST_USER_ID_KEY);
    if (!lastUserId) return null;

    const localUser = await db.getFirstAsync<any>(
      `SELECT * FROM users WHERE id = ? LIMIT 1`,
      [lastUserId]
    );

    if (!localUser) return null;

    return {
      id: localUser.id,
      email: localUser.email,
      user_metadata: {
        username: localUser.username,
        fullname: localUser.fullname,
        profile_pic_url: localUser.profile_pic_url,
        is_verified: !!localUser.is_verified,
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: localUser.created_at || new Date().toISOString(),
    } as User;
  } catch (err) {
    console.warn('⚠️ No se pudo recuperar usuario offline:', err);
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(LAST_USER_ID_KEY);
    setUser(null);
    setSession(null);
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          await AsyncStorage.setItem(LAST_USER_ID_KEY, data.session.user.id);
          await cacheUserProfile(data.session.user.id);
        } else {
          const fallbackUser = await getOfflineUser();
          setSession(null);
          setUser(fallbackUser);
        }

        if (error) {
          console.warn('⚠️ getSession error:', error.message);
        }
      } catch (err) {
        console.warn('⚠️ getSession falló, intentando modo offline...');
        const fallbackUser = await getOfflineUser();
        setSession(null);
        setUser(fallbackUser);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await AsyncStorage.setItem(LAST_USER_ID_KEY, session.user.id);
        await cacheUserProfile(session.user.id);
      } else {
        await AsyncStorage.removeItem(LAST_USER_ID_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);