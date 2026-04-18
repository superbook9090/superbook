'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '@/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language;
      return savedLang && (savedLang === 'en' || savedLang === 'hi') ? savedLang : 'en';
    }
    return 'en';
  });

  // Sync language state with localStorage and trigger re-renders
  const setLang = (language: Language) => {
    setLangState(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[lang];

    for (const k of keys) {
      if (typeof value === 'object' && value !== null) {
        value = (value as Record<string, unknown>)[k];
      }
    }

    return typeof value === 'string' ? value : key;
  };

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
        setLangState(savedLang);
      }
    }
  }, []);

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
