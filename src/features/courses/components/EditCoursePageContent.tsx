'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, Layout, MessageCircle, BookOpen } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { getCourseById } from '@/lib/api/courses';
import { isAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { useUrlTab } from '@/hooks/useUrlTab';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { LazyCreateCourseForm, LazyCurriculumEditor } from '@/lib/lazy';
import { PageWrapper } from '@/components/layout';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';
import { TeacherTabs } from '@/features/teacher/components/TeacherTabs';
import { TeacherDoubtsTab } from '@/app/(dashboard)/dashboard/teacher/courses/[id]/_components/TeacherDoubtsTab';
import CourseActionBar from './CourseActionBar';

export default function EditCoursePageContent({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const { isFeatureEnabled } = useSettingsStore();
  const doubtsEnabled = isFeatureEnabled('enableCourseDoubts');
  const isAdminUser = isAdmin(session?.user?.role);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  });

  const validTabs = useMemo(
    () =>
      (doubtsEnabled
        ? ['basic', 'curriculum', 'doubts']
        : ['basic', 'curriculum']) as ('basic' | 'curriculum' | 'doubts')[],
    [doubtsEnabled]
  );

  const [activeTab, setActiveTab] = useUrlTab<'basic' | 'curriculum' | 'doubts'>(
    validTabs,
    'curriculum'
  );

  const backHref = isAdminUser ? ROUTES.admin.courses : ROUTES.teacher.courses;

  return (
    <PageWrapper>
      <TeacherPageBanner
        icon={BookOpen}
        eyebrow={t('createCoursePage.editTitle')}
        title={course?.title || t('createCoursePage.editTitle')}
        description={t('createCoursePage.editDescription')}
        backHref={backHref}
        backLabel={t('courses.backToCourses')}
        actions={<CourseActionBar courseId={courseId} />}
      />

      <div className="flex items-center justify-between">
        <TeacherTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              id: 'curriculum',
              label: t('courseEdit.curriculum'),
              icon: <Layout className="w-4 h-4" />,
            },
            {
              id: 'basic',
              label: t('courseEdit.basicInfo'),
              icon: <Settings className="w-4 h-4" />,
            },
            ...(doubtsEnabled
              ? [
                  {
                    id: 'doubts' as const,
                    label: t('courseDoubts.tabDoubts'),
                    icon: <MessageCircle className="w-4 h-4" />,
                  },
                ]
              : []),
          ]}
        />
      </div>

      <div className="teacher-panel overflow-hidden p-4 sm:p-6 md:p-7">
        {activeTab === 'basic' && <LazyCreateCourseForm courseId={courseId} />}
        {activeTab === 'curriculum' && <LazyCurriculumEditor courseId={courseId} />}
        {activeTab === 'doubts' && doubtsEnabled && <TeacherDoubtsTab courseId={courseId} />}
      </div>
    </PageWrapper>
  );
}
