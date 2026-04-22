'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function Quizzes() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('quizzesPage.quizzes')}</h1>
      <p className="mt-2 text-gray-600">
        {t('quizzesPage.quizzesDesc')}
      </p>

      <div className="mt-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-gray-500">{t('quizzesPage.quizListPlaceholder')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
