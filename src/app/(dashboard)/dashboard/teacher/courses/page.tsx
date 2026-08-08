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
import Tooltip from '@/components/ui/Tooltip';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTeacherCourses, usePublishCourse, useMarkCourseCompleted, useDeleteCourse, type Course } from '@/lib/react-query/hooks';
import { Trash2, Award, Users } from 'lucide-react';
import { LazyConfirmModal } from '@/lib/lazy';
import { useFeature } from '@/contexts/AppSettingsContext';

export default function TeacherCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const isEnrollmentManagementEnabled = useFeature('enableEnrollmentManagement');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState<string | null>(null);
  const [confirmCompleteCourse, setConfirmCompleteCourse] = useState<string | null>(null);

  // Get orgId from session
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: courses = [], isLoading, error } = useTeacherCourses(orgId);
  const publishCourse = usePublishCourse();
  const markCourseCompleted = useMarkCourseCompleted();
  const deleteCourse = useDeleteCourse();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
    }
  }, [status, session, router]);

  const handlePublishUnpublish = async (courseId: string, isPublished: boolean) => {
    try {
      await publishCourse.mutateAsync({ courseId, isPublished });
      setAlertState({
        type: 'success',
        message: isPublished ? t('teacherCourses.coursePublished') : t('teacherCourses.courseUnpublished')
      });
    } catch (_error) {
      setAlertState({
        type: 'error',
        message: t('teacherCourses.publishError')
      });
      console.error('Publish error:', _error);
    }
  };

  const handleMarkCompleted = async (courseId: string, isCompleted: boolean) => {
    try {
      await markCourseCompleted.mutateAsync({ courseId, isCompleted });
      setAlertState({
        type: 'success',
        message: isCompleted ? t('teacherCourses.courseMarkedCompleted') : t('teacherCourses.courseReopened')
      });
      setConfirmCompleteCourse(null);
    } catch (_error) {
      setAlertState({
        type: 'error',
        message: t('teacherCourses.completeError')
      });
      console.error('Mark completed error:', _error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse.mutateAsync(courseId);
      setAlertState({
        type: 'success',
        message: t('teacherCourses.courseDeleted')
      });
      setConfirmDeleteCourse(null);
    } catch (_error) {
      setAlertState({
        type: 'error',
        message: t('teacherCourses.deleteError')
      });
      console.error('Delete error:', _error);
    }
  };

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
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => router.push(ROUTES.teacher.courseEdit(course._id))}
                        className="flex-1 px-3 py-2 text-sm font-medium text-[var(--teacher-primary)] bg-[var(--teacher-soft)] rounded-lg hover:bg-[var(--teacher-border)] transition-colors"
                      >
                        {t('teacherCourses.edit')}
                      </button>
                      <button
                        onClick={() => handlePublishUnpublish(course._id, !course.isPublished)}
                        disabled={publishCourse.isPending}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${course.isPublished
                          ? 'text-[var(--color-warning)] bg-[var(--color-warning-light)] hover:bg-[var(--color-warning)]/20'
                          : 'text-[var(--color-success)] bg-[var(--color-success-light)] hover:bg-[var(--color-success)]/20'
                          }`}
                      >
                        {publishCourse.isPending ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('common.loading')}
                          </span>
                        ) : (
                          course.isPublished ? t('teacherCourses.unpublish') : t('teacherCourses.publish')
                        )}
                      </button>
                      {isEnrollmentManagementEnabled && (
                        <Tooltip label={t('enrolledStudents.viewStudents')}>
                          <button
                            onClick={() => router.push(ROUTES.teacher.courseStudents(course._id))}
                            aria-label={t('enrolledStudents.viewStudents')}
                            className="p-2 text-[var(--color-muted-foreground)] bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--info-light)] hover:text-[var(--info)] transition-colors"
                          >
                            <Users className="w-5 h-5" />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip label={course.isCompleted ? t('teacherCourses.reopenCourse') : t('teacherCourses.markCompleted')}>
                        <button
                          onClick={() =>
                            course.isCompleted
                              ? handleMarkCompleted(course._id, false)
                              : setConfirmCompleteCourse(course._id)
                          }
                          disabled={markCourseCompleted.isPending}
                          aria-label={course.isCompleted ? t('teacherCourses.reopenCourse') : t('teacherCourses.markCompleted')}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${course.isCompleted
                            ? 'text-[var(--color-info)] bg-[var(--color-info-light)] hover:bg-[var(--color-info)]/20'
                            : 'text-[var(--color-muted-foreground)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-info-light)] hover:text-[var(--color-info)]'
                            }`}
                        >
                          <Award className="w-5 h-5" />
                        </button>
                      </Tooltip>
                      <Tooltip label={t('teacherCourses.deleteCourse') || 'Delete Course'}>
                        <button
                          onClick={() => setConfirmDeleteCourse(course._id)}
                          aria-label={t('teacherCourses.deleteCourse') || 'Delete Course'}
                          className="p-2 text-[var(--color-error)] bg-[var(--color-error-light)] rounded-lg hover:bg-[var(--color-error)]/20 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <LazyConfirmModal
        isOpen={!!confirmCompleteCourse}
        title={t('teacherCourses.completeConfirmTitle') || 'Mark Course as Completed?'}
        message={t('teacherCourses.completeConfirmMessage') || 'Students who have finished all lessons and quizzes will automatically receive a completion certificate. Continue?'}
        onConfirm={() => {
          if (confirmCompleteCourse) {
            handleMarkCompleted(confirmCompleteCourse, true);
          }
        }}
        onCancel={() => setConfirmCompleteCourse(null)}
        confirmText={t('teacherCourses.markCompleted')}
        type="info"
        isLoading={markCourseCompleted.isPending}
      />

      <LazyConfirmModal
        isOpen={!!confirmDeleteCourse}
        title={t('teacherCourses.deleteConfirmTitle') || 'Delete Course'}
        message={t('teacherCourses.deleteConfirmMessage') || 'Are you sure you want to delete this course? This action cannot be undone.'}
        onConfirm={() => {
          if (confirmDeleteCourse) {
            handleDeleteCourse(confirmDeleteCourse);
          }
        }}
        onCancel={() => setConfirmDeleteCourse(null)}
        confirmText={t('common.delete')}
        type="danger"
        isLoading={deleteCourse.isPending}
      />
    </>
  );
}
