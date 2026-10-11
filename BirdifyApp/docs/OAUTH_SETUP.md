# Login / Registro con Google y Facebook

La app ya tiene el código listo (`AuthService.signInWithOAuth`). Para que funcione
solo tienes que configurar los proveedores. **Las claves secretas NO van en el `.env`
de la app**: se guardan en el panel de Supabase (la app solo necesita
`EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`).

Sustituye `<REF>` por el identificador de tu proyecto (`https://<REF>.supabase.co`).

**Callback de Supabase** (la usarás en Google y en Facebook):

```
https://<REF>.supabase.co/auth/v1/callback
```

---

## 1. Supabase: URLs de redirección de la app

Dashboard → **Authentication → URL Configuration → Redirect URLs**, añade:

| URL | Para |
|---|---|
| `birdify://auth/callback` | Dev client / APK / AAB |
| `exp://**` | Expo Go (desarrollo) |

## 2. Supabase: trigger de perfiles

Dashboard → **SQL Editor** → pega y ejecuta [`oauth_trigger.sql`](./oauth_trigger.sql).

---

## 3. Google

1. Entra en <https://console.cloud.google.com/> y crea (o elige) un proyecto.
2. **APIs & Services → OAuth consent screen**
   - Tipo: *External*. Nombre: *Birdify*, email de soporte y dominio.
   - Scopes: `email`, `profile`, `openid`.
   - Mientras esté en *Testing*, añade tu cuenta en **Test users**. Publícalo para abrirlo a todos.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Tipo: **Web application** (aunque la app sea móvil: quien habla con Google es Supabase).
   - *Authorized redirect URIs*: `https://<REF>.supabase.co/auth/v1/callback`
4. Copia el **Client ID** y el **Client Secret**.
5. Supabase → **Authentication → Providers → Google** → *Enable*, pega Client ID y Secret → *Save*.

## 4. Facebook

1. Entra en <https://developers.facebook.com/apps> → **Create app** → caso de uso
   *"Authenticate and request data from users with Facebook Login"*.
2. **Use cases → Facebook Login → Customize**
   - Permisos: añade **email** (y `public_profile`, que viene por defecto).
   - **Settings** → *Valid OAuth Redirect URIs*: `https://<REF>.supabase.co/auth/v1/callback`
3. **App settings → Basic**
   - Copia **App ID** y **App Secret**.
   - Rellena *Privacy Policy URL* y *Data deletion* (obligatorios para pasar a *Live*).
4. Mientras la app esté en *Development*, solo tú y los usuarios añadidos en **App roles** pueden entrar.
   Cambia a **Live** cuando quieras abrirla al público.
5. Supabase → **Authentication → Providers → Facebook** → *Enable*, pega App ID y Secret → *Save*.

---

## 5. Probar

```bash
# Tras cambiar app.config.js (nuevo "scheme"), recompila el dev client una vez:
npx expo run:android      # o: eas build --profile preview --platform android
npx expo start
```

En Expo Go funciona sin recompilar (usa `exp://…/--/auth/callback`).

## Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| "El acceso con X no está habilitado" | Proveedor sin activar en Supabase → Providers. |
| `redirect_uri_mismatch` (Google) | La URI del paso 3.3 no es exactamente la callback de Supabase. |
| "URL bloqueada" (Facebook) | Falta la callback en *Valid OAuth Redirect URIs*. |
| El navegador no vuelve a la app | Falta `birdify://auth/callback` / `exp://**` en Redirect URLs, o no recompilaste tras añadir `scheme`. |
| "No se pudo crear tu perfil" | Ejecuta `oauth_trigger.sql`. |
| Facebook sin email | El usuario no tiene email verificado o falta el permiso `email`. |

> Si un usuario se registró con email y luego entra con Google usando el mismo correo,
> Supabase vincula ambas identidades automáticamente (el email debe estar confirmado).
