import type { Language } from '@/i18n';
import { supportedLanguages } from '@/i18n/config';

export const LANGUAGE_COOKIE = 'language';

export function parseLanguageCookie(value: string | undefined): Language {
  if (value && supportedLanguages.includes(value as Language)) {
    return value as Language;
  }
  return 'en';
}

export function setLanguageCookie(lang: Language) {
  if (typeof document === 'undefined') return;
  document.cookie = `${LANGUAGE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}
