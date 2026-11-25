import type { Language } from '@/i18n';

export const LANGUAGE_COOKIE = 'language';

export function setLanguageCookie(lang: Language) {
  if (typeof document === 'undefined') return;
  document.cookie = `${LANGUAGE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}
