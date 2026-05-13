// src/app/(dashboard)/dashboard/student/browse/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import CourseCard from '@/features/courses/components/CourseCard';
import Alert from '@/components/ui/Alert';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAvailableCourses, useEnrollCourse, type Course } from '@/lib/react-query/hooks';

export default function BrowseCoursesPage() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: availableCourses = [], isLoading: coursesLoading, error } = useAvailableCourses(orgId);
  const enrollCourse = useEnrollCourse();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [status, session, router]);

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollCourse.mutateAsync(courseId);
      router.push('/dashboard/student/courses');
    } catch {
      setAlertState({ type: 'error', message: 'Error enrolling in course' });
    }
  };

  if (status === 'loading' || coursesLoading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] truncate">{t('courses.browseCourses')}</h1>
      <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
        {t('courses.browseDesc')}
      </p>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {error && (
        <div className="mt-4 bg-[var(--error-light)] border-l-4 border-[var(--error)] p-4 rounded-r-lg">
          <p className="text-sm text-[var(--error)]">{String(error)}</p>
        </div>
      )}

      <div className="mt-8">
        {availableCourses.length === 0 ? (
          <div className="bg-[var(--background)] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-[var(--color-muted-foreground)] mb-4">
                {t('courses.noAvailableCourses')}
              </p>
              <Link
                href="/dashboard/student/courses"
                className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-[var(--student-primary)] bg-[var(--student-soft)] hover:bg-[var(--student-border)] transition-colors"
              >
                {t('courses.goToMyCourses')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {availableCourses.map((course: Course) => (
              <CourseCard
                key={course._id}
                course={course}
                type="available"
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
