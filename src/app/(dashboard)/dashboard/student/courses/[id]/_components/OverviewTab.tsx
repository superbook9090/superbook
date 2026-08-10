import React from 'react';

type Props = {
  description: string;
  category: string;
  progress: number;
  t: (key: string) => string;
};

export function OverviewTab({ description, category, progress, t }: Props) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--color-foreground)]">{t('common.overview')}</h2>
        <p className="text-[var(--color-muted-foreground)] leading-relaxed">
          {description || t('courses.noDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--primary-soft)]/50 border border-[var(--primary-border)]/50">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-1">
            {t('courses.category')}
          </h4>
          <p className="text-base font-bold text-[var(--primary-dark)]">{category || 'General'}</p>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--color-success-light)] border border-[var(--color-success)]/20">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-success)] mb-1">
            {t('dashboard.progress')}
          </h4>
          <p className="text-base font-bold text-[var(--color-foreground)]">
            {progress}% {t('dashboard.completed')}
          </p>
        </div>
      </div>
    </div>
  );
}
