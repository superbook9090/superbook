// src/components/ui/LanguageSwitcher.tsx
'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronDown, Globe } from 'lucide-react';
import { languageLabelKeys, supportedLanguages } from '@/i18n/config';

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = supportedLanguages.map((code) => ({
    code,
    name: t(languageLabelKeys[code]),
  }));

  const selectedLanguage = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="hidden sm:inline">{selectedLanguage.name}</span>
        <span className="sm:hidden uppercase">{selectedLanguage.code}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  setLang(language.code as 'en' | 'hi');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  lang === language.code
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{language.name}</span>
                {lang === language.code && (
                  <span className="ml-auto text-indigo-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
