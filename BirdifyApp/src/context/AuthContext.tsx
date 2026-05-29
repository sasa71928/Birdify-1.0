import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { NotificationService } from '../services/notification.service';

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          expo_push_token: token
        })
        .eq('id', userId);
    } catch (e) {
      console.error('Error registering push token:', e);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const ensurePublicProfile = async (authUser: User) => {
    try {
      const { data: existing, error } = await supabase
        .from('users')
        .select('id, email')
        .or(`id.eq.${authUser.id},email.eq.${authUser.email}`)
        .maybeSingle();

      if (error) {
        console.error('Error checking public user profile:', error);
        return;
      }

      // Si no existe el perfil bajo este ID ni este Email, o si el ID del perfil existente es diferente (usuario recreado)
      if (!existing || existing.id !== authUser.id) {
        const rawUsername = authUser.user_metadata?.username || authUser.email?.split('@')[0] || `user_${authUser.id.substring(0, 8)}`;
        const fullname = authUser.user_metadata?.fullname || null;
        const profilePicUrl = authUser.user_metadata?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp';
        
        // Sanitize username to match alphanumeric + underscores
        const sanitizedUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');

        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: authUser.id,
            email: authUser.email,
            username: sanitizedUsername,
            fullname: fullname,
            profile_pic_url: profilePicUrl,
          }, { onConflict: 'email' });

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
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensurePublicProfile(session.user);
      }
      setIsLoading(false);
    });

    // Escuchar cambios de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensurePublicProfile(session.user);
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
