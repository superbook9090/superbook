'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { translations, Language } from '@/i18n';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface LanguageContextType {
  lang: Language;
  setLang: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { storedValue: lang, setValue: setLangState } = useLocalStorage<Language>('language', 'en', {
    serializer: {
      read: (value: string) => {
        const parsed = value as Language;
        return (parsed === 'en' || parsed === 'hi') ? parsed : 'en';
      },
      write: JSON.stringify
    }
  });

  // Sync language state with localStorage and trigger re-renders
  const setLang = (language: Language) => {
    setLangState(language);
  };

  // Translation function with interpolation support
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = translations[lang];

    for (const k of keys) {
      if (typeof value === 'object' && value !== null) {
        value = (value as Record<string, unknown>)[k];
      }
    }

    let result = typeof value === 'string' ? value : key;

    // Replace placeholders with params
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      });
    }

    return result;
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
