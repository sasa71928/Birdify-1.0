---
description: Como buildear la app Birdify para Android (APK/AAB)
---

## Requisitos previos

1. **Tener cuenta en Expo** y estar logueado:
   ```bash
   npx eas login
   ```

2. **Tener el proyecto vinculado a EAS** (ya está — projectId en `app.json`):
   ```bash
   npx eas build:configure
   ```

3. **Variables de entorno** en `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=
   EXPO_PUBLIC_SUPABASE_ANON_KEY=
   EXPO_PUBLIC_EXPO_ACCESS_TOKEN=
   ```

## Build para Android

### Opcion A: APK (para pruebas / distribucion interna)

```bash
npm run build:android:apk
```

O manualmente:
```bash
npx eas build --platform android --profile preview
```

- Genera un `.apk` que puedes instalar directamente en cualquier Android
- Se distribuye por link de descarga interna

### Opcion B: AAB (para Google Play Store)

```bash
npm run build:android:aab
```

O manualmente:
```bash
npx eas build --platform android --profile production
```

- Genera un `.aab` (Android App Bundle)
- Este es el formato requerido para subir a Google Play

### Opcion C: AAB Preview (para pruebas internas)

```bash
npm run build:android:preview
```

- AAB pero con distribucion interna (no Play Store)

## Que pasa despues

1. EAS compila en la nube (puede tardar 10-30 min)
2. Recibes un email con el link de descarga
3. Tambien puedes ver el progreso en: https://expo.dev/accounts/[tu-cuenta]/projects/BirdifyApp/builds

## Si necesitas build local (sin nube)

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

Requiere Android Studio + JDK 17 instalados.

## Notas importantes

- **Google Maps API Key (OBLIGATORIO — sin esto la app crashea al abrir Explore)**: `react-native-maps` en Android standalone **exige** una API key real. El placeholder `"YOUR_GOOGLE_MAPS_API_KEY"` en `app.json` **NO funciona** y provoca `java.lang.IllegalStateException: API key not found`. Obtén una gratis en [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create API Key, habilita "Maps SDK for Android", y reemplázala en `app.json` → `android.config.googleMaps.apiKey`.
- **Variables de entorno en EAS**: El archivo `.env` NO se sube automáticamente a EAS si está en `.gitignore`. Configúralas antes del build:
  ```bash
  eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "tu-url" --scope project --type string
  eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "tu-key" --scope project --type string
  eas env:create --name EXPO_PUBLIC_EXPO_ACCESS_TOKEN --value "tu-token" --scope project --type string
  ```
  O añádelas directamente en el dashboard de [Expo](https://expo.dev).
- **Notificaciones push**: Funcionan solo en dispositivo físico (no emulador) y requieren `EXPO_PUBLIC_EXPO_ACCESS_TOKEN`.
- **New Architecture**: Deshabilitada en `app.json` por incompatibilidad con `react-native-maps` y `react-native-pager-view` en release.
- **Keystore**: EAS maneja el keystore automáticamente.

## Si la APK crashea después del login

1. Conecta el celular por USB y activa **USB Debugging**.
2. Corre en tu PC:
   ```bash
   adb logcat -d | findstr "AndroidRuntime"
   ```
3. Eso te dará el error exacto de crash.

Causas más comunes:
- **Falta Google Maps API key** → crash inmediato al cargar Explore
- **Variables de entorno vacías en EAS** → Supabase falla silenciosamente
- **New Architecture activa en cache** → fuerza build limpio con version bump
