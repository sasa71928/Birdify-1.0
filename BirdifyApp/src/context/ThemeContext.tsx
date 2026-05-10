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
  const [currentColors, setCurrentColors] = useState(Colors);

  useEffect(() => {
    const activeTheme = theme === 'system' ? systemColorScheme : theme;
    setCurrentColors(activeTheme === 'dark' ? DarkColors as any : Colors);
  }, [theme, systemColorScheme]);

  const isDark = (theme === 'system' ? systemColorScheme : theme) === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors: currentColors, setTheme, isDark }}>
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
