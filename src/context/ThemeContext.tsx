import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, DarkColors } from '../theme';

type ThemeType = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = '@birdify:theme';

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof Colors;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (!mounted || !stored) return;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeState(stored);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const setTheme = useCallback((nextTheme: ThemeType) => {
    setThemeState(nextTheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme).catch(() => {});
  }, []);

  const activeTheme =
    theme === 'system'
      ? systemColorScheme ?? 'light'
      : theme;

  const colors = activeTheme === 'dark'
    ? DarkColors
    : Colors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        setTheme,
        isDark: activeTheme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
