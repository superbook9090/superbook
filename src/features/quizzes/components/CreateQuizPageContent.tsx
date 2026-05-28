'use client';

import { LazyCreateQuizForm } from '@/lib/lazy';
import { useTranslation } from '@/hooks/useTranslation';

export default function CreateQuizPageContent({ quizId }: { quizId?: string }) {
  const { t } = useTranslation();
  const isEdit = Boolean(quizId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">
          {isEdit ? t('createQuizPage.editTitle') : t('createQuizPage.title')}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
          {isEdit ? t('createQuizPage.editDescription') : t('createQuizPage.description')}
        </p>
      </div>

      <div className="bg-[var(--card-solid)] shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <LazyCreateQuizForm quizId={quizId} />
        </div>
      </div>
    </div>
  );
}
