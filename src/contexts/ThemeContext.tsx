import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { applyTheme, getStoredTheme, type ThemeMode } from '../lib/theme';

export const ThemeContext = createContext<{
  isDark: boolean;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
} | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within an AppThemeProvider');
  return ctx;
};

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    return getStoredTheme() ?? 'dark';
  });

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (!getStoredTheme()) {
        const next = mq.matches ? 'dark' : 'light';
        setMode(next);
        applyTheme(next);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  };

  const setTheme = (next: ThemeMode) => {
    applyTheme(next);
    setMode(next);
  };

  return (
    <ThemeContext.Provider value={{ isDark: mode === 'dark', mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
