import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const themes = {
  green: {
    name: 'Forest Green',
    primary: '#0d4f3c',
    primaryDark: '#083528',
    primaryLight: '#1a7a5c',
    accent: '#22c55e',
    background: '#f0fdf4',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
  },
  blue: {
    name: 'Ocean Blue',
    primary: '#1e40af',
    primaryDark: '#1e3a8a',
    primaryLight: '#3b82f6',
    accent: '#60a5fa',
    background: '#eff6ff',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
  },
  purple: {
    name: 'Royal Purple',
    primary: '#6b21a8',
    primaryDark: '#581c87',
    primaryLight: '#a855f7',
    accent: '#c084fc',
    background: '#faf5ff',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
  },
  orange: {
    name: 'Sunset Orange',
    primary: '#c2410c',
    primaryDark: '#9a3412',
    primaryLight: '#f97316',
    accent: '#fb923c',
    background: '#fff7ed',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
  },
  teal: {
    name: 'Teal',
    primary: '#0f766e',
    primaryDark: '#115e59',
    primaryLight: '#14b8a6',
    accent: '#2dd4bf',
    background: '#f0fdfa',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
  },
  rose: {
    name: 'Rose',
    primary: '#be123c',
    primaryDark: '#9f1239',
    primaryLight: '#f43f5e',
    accent: '#fb7185',
    background: '#fff1f2',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
  },
  indigo: {
    name: 'Indigo',
    primary: '#4338ca',
    primaryDark: '#3730a3',
    primaryLight: '#6366f1',
    accent: '#818cf8',
    background: '#eef2ff',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
  },
  dark: {
    name: 'Dark Mode',
    primary: '#111827',
    primaryDark: '#030712',
    primaryLight: '#374151',
    accent: '#22c55e',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
  },
  midnight: {
    name: 'Midnight',
    primary: '#1e1b4b',
    primaryDark: '#0f0d24',
    primaryLight: '#312e81',
    accent: '#818cf8',
    background: '#0c0a1f',
    card: '#1e1b4b',
    text: '#e0e7ff',
    textSecondary: '#a5b4fc',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState('green');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('theme');
      if (saved && themes[saved]) setThemeKey(saved);
    })();
  }, []);

  const setTheme = async (key) => {
    if (!themes[key]) return;
    setThemeKey(key);
    await AsyncStorage.setItem('theme', key);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: themes[themeKey],
        themeKey,
        setTheme,
        themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}