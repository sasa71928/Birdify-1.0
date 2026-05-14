import { supabase } from '../lib/supabase';
import { ProfileRepository } from '../repositories/profile.repository';
import { handleError } from '../utils/errors';

export const AuthService = {
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Intentar obtener el perfil del usuario (si la tabla de profiles existe)
      let profile = null;
      try {
        profile = await ProfileRepository.getById(data.user.id);
      } catch (err) {
        console.log('No se pudo cargar el perfil del usuario. Es posible que aún no exista.');
      }
      
      return { user: data.user, session: data.session, profile };
    } catch (error) {
      throw handleError(error);
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw handleError(error);
    }
  }
};
