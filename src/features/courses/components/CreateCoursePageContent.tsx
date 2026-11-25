'use client';

import { BookOpen } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { LazyCreateCourseForm } from '@/lib/lazy';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper } from '@/components/layout';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';

export default function CreateCoursePageContent() {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <TeacherPageBanner
        icon={BookOpen}
        eyebrow={t('common.myCourses')}
        title={t('createCoursePage.title')}
        description={t('createCoursePage.description')}
        backHref={ROUTES.teacher.courses}
        backLabel={t('courses.backToCourses')}
      />

      <div className="teacher-panel p-4 sm:p-6 md:p-7">
        <LazyCreateCourseForm />
      </div>
    </PageWrapper>
  );
}
