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
        className="flex items-center gap-2 px-3 py-2 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-muted)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent shadow-sm"
      >
        <Globe className="w-4 h-4 text-[var(--color-muted)]" />
        <span className="hidden sm:inline">{selectedLanguage.name}</span>
        <span className="sm:hidden uppercase">{selectedLanguage.code}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--color-muted-foreground)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-lg shadow-lg z-20 overflow-hidden">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  setLang(language.code as 'en' | 'hi');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  lang === language.code
                    ? 'bg-[var(--color-accent)] text-[var(--color-primary)]'
                    : 'text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]'
                }`}
              >
                <span>{language.name}</span>
                {lang === language.code && (
                  <span className="ml-auto text-[var(--color-primary)]">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
