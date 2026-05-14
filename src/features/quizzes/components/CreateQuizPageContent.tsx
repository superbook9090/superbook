'use client';

import CreateQuizForm from '@/features/quizzes/components/CreateQuizForm';
import { useTranslation } from '@/hooks/useTranslation';

export default function CreateQuizPageContent() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">
          {t('createQuizPage.title')}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
          {t('createQuizPage.description')}
        </p>
      </div>

      <div className="bg-[var(--card-solid)] shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <CreateQuizForm />
        </div>
      </div>
    </div>
  );
}
