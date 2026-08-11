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
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="space-y-1 text-sm">
        <h4 className="font-semibold text-amber-800 dark:text-amber-300">
          {t('notes.pageLimitReached')}
        </h4>
        <p className="opacity-90 leading-relaxed">
          {t('notes.pageLimitReachedDesc')
            .replace('{current}', String(usedPages))
            .replace('{limit}', String(limitPages))}
        </p>
      </div>
    </div>
  );
}
