// src/components/ui/LanguageSwitcher.tsx
'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronDown, Globe } from 'lucide-react';
import { languageLabelKeys, supportedLanguages } from '@/i18n/config';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  /** Tighter padding for mobile headers */
  compact?: boolean;
  /** Show full language name on all screen sizes (desktop-style) */
  alwaysShowLabel?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  compact = false,
  alwaysShowLabel = false,
  className,
}: LanguageSwitcherProps = {}) {
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
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('language.selectLanguage')}
        className={cn(
          'flex items-center gap-2 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-lg font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-muted)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent shadow-sm',
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
          className
        )}
      >
        <Globe className={cn('text-[var(--color-muted)]', compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
        {alwaysShowLabel ? (
          <span>{selectedLanguage.name}</span>
        ) : (
          <>
            <span className="hidden sm:inline">{selectedLanguage.name}</span>
            <span className="sm:hidden uppercase">{selectedLanguage.code}</span>
          </>
        )}
        <ChevronDown
          className={cn(
            'text-[var(--color-muted-foreground)] transition-transform',
            compact ? 'w-3.5 h-3.5' : 'w-4 h-4',
            isOpen && 'rotate-180'
          )}
        />
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
