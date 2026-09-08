import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { lightTheme, darkTheme, type AppTheme } from '@/shared/themes/theme';
import type { StyleSheet } from 'react-native';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  themeMode: 'light',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

const THEME_STORAGE_KEY = 'app_theme_mode';

const saveThemePreference = async (mode: ThemeMode) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } else {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
    }
  } catch (e) {
    console.error('Failed to save theme preference', e);
  }
};

const getThemePreference = async (): Promise<ThemeMode | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    } else {
      return (await SecureStore.getItemAsync(THEME_STORAGE_KEY)) as ThemeMode | null;
    }
  } catch (e) {
    console.error('Failed to load theme preference', e);
    return null;
  }
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await getThemePreference();
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setThemeModeState(storedTheme);
      }
    };
    void loadTheme();
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    void saveThemePreference(mode);
  };

  const toggleTheme = () => {
    setThemeModeState((prevMode: ThemeMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      void saveThemePreference(newMode);
      return newMode;
    });
  };

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);

/**
 * Hook to create styles that automatically update when the theme changes.
 *
 * Usage:
 * const styles = useStyles((theme) => StyleSheet.create({ container: { backgroundColor: theme.colors.background } }));
 */
export function useStyles<T extends StyleSheet.NamedStyles<T>>(
  styleCreator: (theme: AppTheme) => T,
): T {
  const { theme } = useAppTheme();
  return useMemo(() => styleCreator(theme), [theme, styleCreator]);
}
