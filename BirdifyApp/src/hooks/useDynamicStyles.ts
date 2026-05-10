import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { createSharedStyles } from '../styles/shared/shared.styles';

export const useDynamicStyles = <T extends Record<string, any>>(createStyles?: (colors: any) => T) => {
  const theme = useTheme();
  const colors = theme?.colors || Colors;
  const isDark = theme?.isDark || false;
  
  return useMemo(() => {
    const shared = createSharedStyles(colors) || {};
    const screen = createStyles ? createStyles(colors) : ({} as T);
    
    return {
      shared,
      screen,
      colors,
      isDark,
    };
  }, [colors, createStyles, isDark]);
};
