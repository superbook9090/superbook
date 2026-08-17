// src/app/(dashboard)/dashboard/teacher/courses/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTeacherCourses, type Course } from '@/lib/react-query/hooks';
import { PageWrapper, PageHeader, ResponsiveGrid, EmptyState } from '@/components/layout';
import { Award, BookOpen, Plus } from 'lucide-react';

export default function TeacherCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  // Get orgId from session
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: courses = [], isLoading, error } = useTeacherCourses(orgId);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (error) {
      addAlert({ type: 'error', message: String(error) });
    }
  }, [error, addAlert]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <PageHeader
        title={t('teacherCourses.myCourses')}
        description={t('teacherCourses.coursesDesc')}
        actions={
          <Link
            href={ROUTES.teacher.courseCreate}
            className="btn-premium w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('teacherCourses.createNewCourse')}
          </Link>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20">
          {String(error)}
        </div>
      )}

      <div>
        {courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t('teacherCourses.noCoursesYet')}
            description={t('teacherCourses.coursesDesc')}
            action={
              <Link
                href={ROUTES.teacher.courseCreate}
                className="btn-premium min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('teacherCourses.createFirstCourse')}
              </Link>
            }
          />
        ) : (
          <ResponsiveGrid variant="dense">
            {courses.map((course: Course) => (
              <div
                key={course._id}
                className="bg-[var(--card-solid)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden hover:shadow-[var(--shadow-md)] transition-all flex flex-col"
              >
                {course.thumbnail ? (
                  <div className="relative h-36 sm:h-40 w-full">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-36 sm:h-40 bg-gradient-to-br from-[var(--teacher-primary)] to-[var(--teacher-accent)] flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-white/80" />
                  </div>
                )}
                <div className="card-body flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${course.isPublished
                        ? 'bg-[var(--success-light)] text-[var(--success)]'
                        : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                        }`}>
                        {course.isPublished ? t('teacherCourses.published') : t('teacherCourses.draft')}
                      </span>
                      {course.isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-info-light)] text-[var(--color-info)]">
                          <Award className="w-3 h-3" />
                          {t('teacherCourses.completed')}
                        </span>
                      )}
                      {(course as { isPrivate?: boolean }).isPrivate && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-warning-light)] text-[var(--color-warning)]">
                          {t('courses.privateCourse')}
                        </span>
                      )}
                    </div>
                    {course.category && (
                      <span className="text-xs font-medium text-[var(--color-muted-foreground)]">{course.category}</span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-3 line-clamp-2">{course.description || t('teacherCourses.noDescription')}</p>
                  <div className="mt-auto flex items-center justify-between text-xs sm:text-sm font-medium text-[var(--color-muted-foreground)]">
                    <span>{course.enrolledCount || 0} {t('teacherCourses.studentsEnrolled')}</span>
                    <span className="font-bold text-[var(--color-foreground)]">{course.price > 0 ? `₹${course.price}` : t('teacherCourses.free')}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-[var(--border)]">
                    <Button
                      onClick={() => router.push(ROUTES.teacher.courseEdit(course._id))}
                      variant="primary"
                      fullWidth
                      className="min-h-[38px] text-xs sm:text-sm"
                    >
                      {t('teacherCourses.edit') || 'Edit Course'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </ResponsiveGrid>
        )}
      </div>
    </PageWrapper>
  );
}
