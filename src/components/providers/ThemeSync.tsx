'use client';

import { useEffect } from 'react';
import {
  applyResolvedTheme,
  getStoredThemePreference,
  resolveTheme,
} from '@/lib/theme';

/** Keeps data-theme in sync with the OS theme while the preference is "system". */
export default function ThemeSync() {
  useEffect(() => {
    applyResolvedTheme(resolveTheme(getStoredThemePreference()));

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (getStoredThemePreference() === 'system') {
        applyResolvedTheme(media.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return null;
}
