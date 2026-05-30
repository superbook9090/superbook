'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { translate, type Language, type TranslationKeyInput } from '@/i18n';
import { supportedLanguages } from '@/i18n/config';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { setLanguageCookie } from '@/lib/cookies/language';

interface LanguageContextType {
  lang: Language;
  setLang: (language: Language) => void;
  t: (key: TranslationKeyInput, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { storedValue: lang, setValue: setLangState } = useLocalStorage<Language>('language', 'en', {
    serializer: {
      read: (value: string) => {
        const parsed = value as Language;
        return supportedLanguages.includes(parsed) ? parsed : 'en';
      },
      write: JSON.stringify
    }
  });

  const t = (key: TranslationKeyInput, params?: Record<string, string | number>): string =>
    translate(lang, key, params);

  useEffect(() => {
    document.documentElement.lang = lang;
    setLanguageCookie(lang);

    document.querySelectorAll<HTMLElement>('[data-i18n-key]').forEach((el) => {
      const key = el.getAttribute('data-i18n-key');
      if (key) {
        el.textContent = translate(lang, key);
      }
    });
  }, [lang]);

  const setLang = (language: Language) => {
    setLangState(language);
    setLanguageCookie(language);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
