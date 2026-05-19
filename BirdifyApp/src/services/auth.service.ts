import { supabase } from '../lib/supabase';
import { ProfileRepository } from '../repositories/profile.repository';
import { handleError } from '../utils/errors';

export const AuthService = {
  async signIn(emailOrUsername: string, password: string) {
    try {
      let email = emailOrUsername.trim();
      
      // Si el input empieza con '@', lo removemos y asumimos que es un nombre de usuario
      if (email.startsWith('@')) {
        email = email.substring(1).trim();
      }

      // Si no contiene un '@' o no tiene un formato de correo simple, asumimos que es username
      const isEmail = email.includes('@') && email.indexOf('.') > email.indexOf('@');
      
      if (!isEmail) {
        // Hacemos una consulta insensible a mayúsculas/minúsculas usando ilike
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .ilike('username', email)
          .maybeSingle();
        
        if (userError) {
          console.error('Error al resolver el nombre de usuario:', userError);
          throw new Error('Error de conexión al validar el usuario. Intenta ingresando tu correo electrónico.');
        }
        
        if (!userData) {
          throw new Error('El nombre de usuario ingresado no está registrado.');
        }
        email = userData.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Intentar obtener el perfil del usuario
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

  async signUp(email: string, password: string, username: string, fullname: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            fullname,
            full_name: fullname, 
            profile_pic_url: 'https://gravatar.com/avatar/?d=mp'
          }
        }
      });
      if (error) throw error;
      return data;
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
