// src/app/(dashboard)/dashboard/teacher/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import Alert from '@/components/ui/Alert';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { useTeacherCourses, type Course } from '@/lib/react-query/hooks';

export default function TeacherCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Get orgId from session
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: courses = [], isLoading, error } = useTeacherCourses(orgId);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Course cards skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] truncate">{t('teacherCourses.myCourses')}</h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
              {t('teacherCourses.coursesDesc')}
            </p>
          </div>
          <a
            href="/dashboard/teacher/courses/create"
            className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
          >
            {t('teacherCourses.createNewCourse')}
          </a>
        </div>

        {error && (
          <div className="mt-4 bg-[var(--error-light)] border-l-4 border-[var(--error)] p-4 rounded-r-lg">
            <p className="text-sm text-[var(--error)]">{String(error)}</p>
          </div>
        )}

        <div className="mt-8">
        {courses.length === 0 ? (
          <div className="bg-[var(--background)] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-[var(--color-muted-foreground)] mb-4">{t('teacherCourses.noCoursesYet')}</p>
              <a
                href="/dashboard/teacher/courses/create"
                className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
              >
                {t('teacherCourses.createFirstCourse')}
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: Course) => (
              <div
                key={course._id}
                className="bg-[var(--card-solid)] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {course.thumbnail ? (
                  <div className="relative h-40">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-[var(--teacher-primary)] to-[var(--teacher-accent)] flex items-center justify-center">
                    <span className="text-white text-4xl">📚</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.isPublished
                        ? 'bg-[var(--success-light)] text-[var(--success)]'
                        : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'
                    }`}>
                      {course.isPublished ? t('teacherCourses.published') : t('teacherCourses.draft')}
                    </span>
                    {course.category && (
                      <span className="text-xs text-[var(--color-muted-foreground)]">{course.category}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">{course.title}</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)] mb-4 line-clamp-2">{course.description || t('teacherCourses.noDescription')}</p>
                  <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
                    <span>{course.enrolledCount || 0} {t('teacherCourses.studentsEnrolled')}</span>
                    <span>{course.price > 0 ? `₹${course.price}` : t('teacherCourses.free')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
