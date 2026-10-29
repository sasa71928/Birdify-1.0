/**
 * Logger seguro para producción:
 * Silencia mensajes, advertencias y trazas crudas en builds de producción (__DEV__ === false)
 * para evitar exposición de tokens, correos o metadatos en adb logcat / consola del sistema (AUD-024).
 */
if (!__DEV__) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
  console.error = () => {};
}

export const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (__DEV__) {
      console.error(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (__DEV__) {
      console.info(...args);
    }
  },
};
