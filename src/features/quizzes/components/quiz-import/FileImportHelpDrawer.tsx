'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface FileImportHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadTemplate: () => void;
}

export function FileImportHelpDrawer({
  isOpen,
  onClose,
  onDownloadTemplate,
}: FileImportHelpDrawerProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-accent)]">
        <h4 className="font-medium text-[var(--color-foreground)]">{t('createQuizForm.howToUseImport')}</h4>
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] text-lg leading-none px-1"
          aria-label={t('createQuizForm.closeHelp')}
        >
          ×
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            {t('createQuizForm.importQuestionsFromExcel')}
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            {t('createQuizForm.importInstructions')}
          </p>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)]">{t('createQuizForm.importHelpFormats')}</p>
        <p className="text-sm text-[var(--color-muted-foreground)]">{t('createQuizForm.importHelpCorrectAnswer')}</p>
        <button
          type="button"
          onClick={onDownloadTemplate}
          className="inline-flex items-center justify-center min-h-[36px] px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-primary)] bg-[var(--color-card)] hover:bg-[var(--color-accent)] transition-colors"
        >
          {t('createQuizForm.downloadTemplate')}
        </button>
      </div>
    </div>
  );
}
