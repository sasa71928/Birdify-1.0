import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, DarkColors } from '../theme';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof Colors;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();

  const [theme, setTheme] = useState<ThemeType>('system');

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
