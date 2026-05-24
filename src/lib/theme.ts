export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'theme';

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return null;
}

export function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(): ThemeMode {
  return getStoredTheme() ?? 'dark';
}

export function applyTheme(mode: ThemeMode): void {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem(STORAGE_KEY, mode);
}

export const designTokens = {
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  elevated: 'var(--elevated)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  accent: 'var(--accent)',
  accentHover: 'var(--accent-hover)',
  accentDim: 'var(--accent-dim)',
  glass: 'var(--glass)',
  glassBorder: 'var(--glass-border)',
  border: 'var(--border)',
  borderGold: 'var(--border-gold)',
} as const;
