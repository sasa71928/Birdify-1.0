import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { es, TranslationSchema } from './locales/es';
import { en } from './locales/en';

export type SupportedLanguage = 'es' | 'en' | 'fr' | 'de';

const LANGUAGE_STORAGE_KEY = '@birdify/language';

const DICTIONARIES: Record<string, TranslationSchema> = {
  es,
  en,
  fr: en, // Fallback en inglés hasta disponer de traductores nativos
  de: en, // Fallback en inglés
};

const LOCALE_TAGS: Record<SupportedLanguage, string> = {
  es: 'es-ES',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
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

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  locale: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: async () => {},
  locale: 'es-ES',
  t: (key: string) => key,
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

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('es');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (saved && (saved === 'es' || saved === 'en' || saved === 'fr' || saved === 'de')) {
          setLanguageState(saved as SupportedLanguage);
        } else {
          // Detectar por defecto del sistema
          try {
            const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale || '';
            if (systemLocale.toLowerCase().startsWith('es')) {
              setLanguageState('es');
            } else if (systemLocale.toLowerCase().startsWith('en')) {
              setLanguageState('en');
            }
          } catch {
            setLanguageState('es');
          }
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback(async (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('[LanguageContext] Failed to persist language:', e);
    }
  }, []);

  const locale = LOCALE_TAGS[language] || 'es-ES';

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = DICTIONARIES[language] || DICTIONARIES.es;
      let rawText = getNestedValue(dict, key);
      if (!rawText && language !== 'en') {
        rawText = getNestedValue(DICTIONARIES.en, key);
      }
      if (!rawText) {
        return key;
      }
      return interpolate(rawText, params);
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      locale,
      t,
    }),
    [language, setLanguage, locale, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  const { t, locale, language } = useContext(LanguageContext);
  return { t, locale, language };
}

