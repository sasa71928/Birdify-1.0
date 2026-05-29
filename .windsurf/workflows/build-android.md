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

- **Notificaciones push**: Funcionan solo en dispositivo fisico (no emulador) y requieren `EXPO_PUBLIC_EXPO_ACCESS_TOKEN`
- **Icono de notificacion**: Opcional. Si quieres uno custom, crea `assets/notification-icon.png` (96x96, blanco sobre transparente) y configura el plugin `expo-notifications` en `app.json`
- **Keystore**: EAS maneja el keystore automaticamente. Para produccion, puedes subir tu propio keystore si ya tienes uno
