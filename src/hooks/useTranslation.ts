// src/hooks/useTranslation.ts
'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslation() {
  const { t, lang, setLang } = useLanguage();
  return { t, lang, setLang };
}
