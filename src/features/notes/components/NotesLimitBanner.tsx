import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface NotesLimitBannerProps {
  usedPages: number;
  limitPages: number;
}

export function NotesLimitBanner({ usedPages, limitPages }: NotesLimitBannerProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--warning-light)] border border-[var(--warning)]/30 text-[var(--color-foreground)]">
      <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
      <div className="space-y-1 text-sm">
        <h4 className="font-semibold text-[var(--warning)]">
          {t('notes.pageLimitReached')}
        </h4>
        <p className="text-[var(--color-muted-foreground)] leading-relaxed">
          {t('notes.pageLimitReachedDesc')
            .replace('{current}', String(usedPages))
            .replace('{limit}', String(limitPages))}
        </p>
      </div>
    </div>
  );
}
