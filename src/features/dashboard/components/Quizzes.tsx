'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function Quizzes() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">{t('quizzesPage.quizzes')}</h1>
      <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
        {t('quizzesPage.quizzesDesc')}
      </p>

      <div className="mt-6 sm:mt-8">
        <div className="bg-[var(--card-solid)] overflow-hidden shadow rounded-lg">
          <div className="px-3 sm:px-4 py-4 sm:py-6">
            <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">{t('quizzesPage.quizListPlaceholder')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
