export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_CHANGE_EVENT = 'quizdo:theme-change';
export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return DEFAULT_THEME_PREFERENCE;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_THEME_PREFERENCE;
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

/** Applies the theme to <html> without persisting. */
export function applyResolvedTheme(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

/** Persists the preference (system = no stored value) and applies it. */
export function setThemePreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* private mode — preference just won't persist */
  }
  applyResolvedTheme(resolveTheme(preference));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: preference }));
  }
}
