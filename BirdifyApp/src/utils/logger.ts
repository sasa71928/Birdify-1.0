/**
 * Logger seguro para producción:
 * Silencia mensajes e inspección de objetos en builds de producción (__DEV__ === false)
 * para evitar exposición de datos en consola/adb logcat y optimizar el rendimiento JS (C-03).
 */
if (!__DEV__) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}

export const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  info: (...args: any[]) => {
    if (__DEV__) {
      console.info(...args);
    }
  },
};
