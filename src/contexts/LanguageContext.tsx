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
      if (!key) return;
      const text = translate(lang, key);
      const sep = ' — ';
      // Elements opting in keep the trailing phrase wrapped in a gradient span
      if (el.hasAttribute('data-i18n-gradient') && text.includes(sep)) {
        const i = text.indexOf(sep) + sep.length;
        el.textContent = text.slice(0, i);
        const span = document.createElement('span');
        span.className = 'gradient-text';
        span.textContent = text.slice(i);
        el.append(span);
      } else {
        el.textContent = text;
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
