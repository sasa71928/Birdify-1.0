import { useCallback, useState } from 'react';
import { AuthService, OAuthCancelledError, OAuthProvider } from '../services/auth.service';

/**
 * Hook compartido por Login y Registro para autenticarse con Google / Facebook.
 * Tras el éxito no hace falta navegar: el AuthProvider detecta la sesión
 * y cambia automáticamente al stack principal.
 */
export function useSocialAuth(onError: (message: string) => void) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const signInWith = useCallback(
    async (provider: OAuthProvider) => {
      if (loadingProvider) return;
      setLoadingProvider(provider);
      try {
        await AuthService.signInWithOAuth(provider);
      } catch (error: any) {
        // Si el usuario cerró la ventana no mostramos error
        if (error instanceof OAuthCancelledError) return;

        const name = provider === 'google' ? 'Google' : 'Facebook';
        let msg: string = error?.message || `No se pudo continuar con ${name}.`;
        if (/provider is not enabled|Unsupported provider/i.test(msg)) {
          msg = `El acceso con ${name} no está habilitado en el servidor.`;
        } else if (/Database error saving new user/i.test(msg)) {
          msg = 'No se pudo crear tu perfil. Inténtalo de nuevo más tarde.';
        }
        onError(msg);
      } finally {
        setLoadingProvider(null);
      }
    },
    [loadingProvider, onError]
  );

  return { signInWith, loadingProvider, isSocialLoading: loadingProvider !== null };
}
