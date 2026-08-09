// src/app/(dashboard)/dashboard/teacher/courses/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTeacherCourses, type Course } from '@/lib/react-query/hooks';
import { Award } from 'lucide-react';

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
      router.push(ROUTES.login);
    }
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
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
          <Link
            href={ROUTES.teacher.courseCreate}
            className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
          >
            {t('teacherCourses.createNewCourse')}
          </Link>
        </div>

        {error && (
          <Alert
            type="error"
            message={String(error)}
            onClose={() => setAlertState(null)}
            className="relative top-0 right-0 left-0 translate-x-0 w-full mt-4 z-10"
          />
        )}

        <div className="mt-8">
          {courses.length === 0 ? (
            <div className="bg-[var(--background)] overflow-hidden shadow rounded-lg">
              <div className="px-4 py-8 sm:p-6 text-center">
                <p className="text-[var(--color-muted-foreground)] mb-4">{t('teacherCourses.noCoursesYet')}</p>
                <Link
                  href={ROUTES.teacher.courseCreate}
                  className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
                >
                  {t('teacherCourses.createFirstCourse')}
                </Link>
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
                    <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isPublished
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                          }`}>
                          {course.isPublished ? t('teacherCourses.published') : t('teacherCourses.draft')}
                        </span>
                        {course.isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-info-light)] text-[var(--color-info)]">
                            <Award className="w-3 h-3" />
                            {t('teacherCourses.completed')}
                          </span>
                        )}
                        {(course as { isPrivate?: boolean }).isPrivate && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-warning-light)] text-[var(--color-warning)]">
                            {t('courses.privateCourse')}
                          </span>
                        )}
                      </div>
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

                    {/* Action Buttons */}
                    <div className="flex mt-4 pt-4 border-t border-[var(--border)]">
                      <Button
                        onClick={() => router.push(ROUTES.teacher.courseEdit(course._id))}
                        variant="primary"
                        fullWidth
                      >
                        {t('teacherCourses.edit') || 'Edit Course'}
                      </Button>
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
