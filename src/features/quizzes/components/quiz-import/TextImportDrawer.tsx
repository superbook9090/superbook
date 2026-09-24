'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface TextImportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  importText: string;
  setImportText: (text: string) => void;
  onParse: () => void;
  isParsing: boolean;
}

export function TextImportDrawer({
  isOpen,
  onClose,
  importText,
  setImportText,
  onParse,
  isParsing,
}: TextImportDrawerProps) {
  const { t } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-accent)]">
        <h4 className="font-medium text-[var(--color-foreground)]">{t('createQuizForm.pasteText')}</h4>
        <div className="flex shrink-0 gap-2 items-center">
          <button
            type="button"
            onClick={() => setShowHelp((open) => !open)}
            className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80 px-2 py-1"
          >
            {t('createQuizForm.howToUseTextImport')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] text-lg leading-none px-1"
            aria-label={t('createQuizForm.closeHelp')}
          >
            ×
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
          <p className="text-sm text-[var(--color-muted-foreground)] whitespace-pre-wrap">
            {t('createQuizForm.textImportInstructions')}
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
            {t('createQuizForm.importHelpCorrectAnswer')}
          </p>
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-success)]" />
          <span>
            {t('createQuizForm.supportsRawAndPipeText') ||
              'Auto-detects pasted questions with options (A, B, C, D) & answer key or pipe-separated format.'}
          </span>
        </div>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={t('createQuizForm.pasteTextPlaceholder')}
          className="w-full h-40 p-3 text-sm rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-foreground)] font-mono resize-y"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onParse}
            disabled={isParsing || !importText.trim()}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isParsing ? t('createQuizForm.parsingFile') : t('createQuizForm.parseText')}
          </button>
        </div>
      </div>
    </div>
  );
}
