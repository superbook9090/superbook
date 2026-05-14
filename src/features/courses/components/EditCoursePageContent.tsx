'use client';

import CreateCourseForm from '@/features/courses/components/CreateCourseForm';
import { useTranslation } from '@/hooks/useTranslation';

export default function EditCoursePageContent({ courseId }: { courseId: string }) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">
          {t('createCoursePage.editTitle')}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
          {t('createCoursePage.editDescription')}
        </p>
      </div>

      <div className="bg-[var(--card-solid)] shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <CreateCourseForm courseId={courseId} />
        </div>
      </div>
    </div>
  );
}
