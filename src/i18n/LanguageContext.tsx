import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSharedValue, withTiming, SharedValue } from 'react-native-reanimated';
import { AccessibilityInfo } from 'react-native';
import { es, TranslationSchema } from './locales/es';
import { en } from './locales/en';

export type SupportedLanguage = 'es' | 'en';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['es', 'en'];

const LANGUAGE_STORAGE_KEY = '@birdify/language';

const DICTIONARIES: Record<SupportedLanguage, TranslationSchema> = {
  es,
  en,
};

const LOCALE_TAGS: Record<SupportedLanguage, string> = {
  es: 'es-ES',
  en: 'en-US',
};

// Tipo para path anidado tipo 'chat.placeholder' o 'common.cancel'
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? string extends F
      ? string
      : `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;

export type TranslationKey = Join<PathsToStringProps<TranslationSchema>, '.'>;
export type TranslationParams = Record<string, string | number>;

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  locale: string;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  /** 0 → contenido visible, 1 → overlay de transición cubriendo la pantalla */
  transition: SharedValue<number> | null;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: async () => {},
  locale: 'es-ES',
  t: (key: string) => key,
  transition: null,
});

function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

function normalizeLanguage(value: string | null | undefined): SupportedLanguage | null {
  if (!value) return null;
  if (value === 'es' || value === 'en') return value;
  // Idiomas retirados (fr/de usaban inglés como fallback) → migrar a inglés
  if (value === 'fr' || value === 'de') return 'en';
  return null;
}

function detectSystemLanguage(): SupportedLanguage {
  try {
    const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    return systemLocale.toLowerCase().startsWith('es') ? 'es' : 'en';
  } catch {
    return 'es';
  }
}

// ── Estado global (para código fuera de React: servicios, utils, Alert) ──────
let currentLanguage: SupportedLanguage = detectSystemLanguage();

function translateWith(language: SupportedLanguage, key: string, params?: TranslationParams): string {
  const rawText =
    getNestedValue(DICTIONARIES[language], key) ??
    getNestedValue(DICTIONARIES.es, key);
  if (!rawText) return key;
  return interpolate(rawText, params);
}

/** Traduce fuera de componentes React usando el idioma activo. */
export function translate(key: TranslationKey, params?: TranslationParams): string {
  return translateWith(currentLanguage, key, params);
}

export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function getCurrentLocale(): string {
  return LOCALE_TAGS[currentLanguage];
}

const FADE_IN_MS = 60;
const FADE_OUT_MS = 90;

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(currentLanguage);
  const [isReady, setIsReady] = useState(false);
  const transition = useSharedValue(0);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mantener sincronizado el idioma global antes de que los hijos rendericen
  currentLanguage = language;

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (!mounted) return;
        const normalized = normalizeLanguage(saved);
        if (normalized) {
          currentLanguage = normalized;
          setLanguageState(normalized);
          if (normalized !== saved) {
            AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, normalized).catch(() => {});
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsReady(true);
      });
    return () => {
      mounted = false;
      if (switchTimer.current) clearTimeout(switchTimer.current);
    };
  }, []);

  const applyLanguage = useCallback(async (newLang: SupportedLanguage) => {
    currentLanguage = newLang;
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('[LanguageContext] Failed to persist language:', e);
    }
  }, []);

  const setLanguage = useCallback(
    async (newLang: SupportedLanguage) => {
      if (newLang === currentLanguage) return;
      const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);
      if (reduceMotion) {
        await applyLanguage(newLang);
        return;
      }
      // Crossfade: cubrir → cambiar textos → descubrir
      transition.value = withTiming(1, { duration: FADE_IN_MS });
      if (switchTimer.current) clearTimeout(switchTimer.current);
      await new Promise<void>((resolve) => {
        switchTimer.current = setTimeout(resolve, FADE_IN_MS + 10);
      });
      await applyLanguage(newLang);
      requestAnimationFrame(() => {
        transition.value = withTiming(0, { duration: FADE_OUT_MS });
      });
    },
    [applyLanguage, transition]
  );

  const locale = LOCALE_TAGS[language];

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => translateWith(language, key, params),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      locale,
      t,
      transition,
    }),
    [language, setLanguage, locale, t, transition]
  );

  // Evita el parpadeo ES→EN mientras se lee la preferencia guardada
  if (!isReady) return null;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  const { t, locale, language } = useContext(LanguageContext);
  return { t, locale, language };
}
