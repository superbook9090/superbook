'use client';

import { LazyCreateCourseForm } from '@/lib/lazy';
import { useTranslation } from '@/hooks/useTranslation';

export default function CreateCoursePageContent() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">
          {t('createCoursePage.title')}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
          {t('createCoursePage.description')}
        </p>
      </div>

      <div className="bg-[var(--card-solid)] shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <LazyCreateCourseForm />
        </div>
      </div>
    </div>
  );
}
