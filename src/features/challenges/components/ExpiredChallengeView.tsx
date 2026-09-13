'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export function ExpiredChallengeView() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="card-surface p-8 rounded-3xl border border-[var(--color-border)] text-center max-w-md w-full shadow-2xl">
        <span className="text-4xl mb-3 block">⏳</span>
        <h1 className="text-xl font-bold text-[var(--color-foreground)]">
          {t('challenge.expiredTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-2">
          {t('challenge.expiredDesc')}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
        >
          {t('challenge.exploreQuizzes')}
        </Link>
      </div>
    </div>
  );
}
