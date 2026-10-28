# Birdify

Aplicación móvil para observación de aves y red social para ornitólogos, construida con **Expo**, **React Native**, **TypeScript**, **SQLite** (soporte offline-first) y **Supabase**.

## Requisitos previos

- Node.js >= 20
- npm
- Expo CLI / EAS CLI (`npm install -g eas-cli` para builds en la nube)

## Configuración inicial

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` a `.env` y completar las variables de entorno:
   ```bash
   cp .env.example .env
   ```
3. Aplicar las migraciones SQL de seguridad y funciones en Supabase Cloud siguiendo el orden en `docs/migrations/` (la migración `05_p0_critical_security_hardening.sql` consolida el endurecimiento crítico P0).

## Comandos principales

- `npm start`: Inicia el servidor de desarrollo de Expo.
- `npm run android`: Compila y ejecuta en Android (development build).
- `npm run ios`: Compila y ejecuta en iOS (development build).
- `npm run typecheck`: Ejecuta verificación estática de tipos TypeScript (`tsc --noEmit`).
