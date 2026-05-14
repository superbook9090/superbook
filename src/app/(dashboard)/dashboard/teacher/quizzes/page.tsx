// src/app/(dashboard)/dashboard/teacher/quizzes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { listTeacherCoursesSelf } from '@/lib/api/courses';
import { listQuizzesAll, patchQuiz, deleteQuiz } from '@/lib/api/quizzes';
import { ApiClientError } from '@/lib/api/http';
import Alert from '@/components/ui/Alert';
import { PageSkeleton } from '@/components/ui/Skeleton';

interface Course {
  _id: string;
  title: string;
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  timeLimit: number;
  questions: { question: string }[];
  course: Course | { _id: string } | string;
  isPublished: boolean;
  createdAt: string;
}

export default function TeacherQuizzesPage() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Memoized helper to safely get course title
  const getCourseTitle = useCallback((course: Quiz['course']): string => {
    if (typeof course === 'object' && course !== null && 'title' in course) {
      return (course as Course).title;
    }
    return t('teacherQuizzes.unknownCourse');
  }, [t]);

  const fetchData = useCallback(async () => {
    try {
      const coursesData = await listTeacherCoursesSelf();
      const teacherCourses: Course[] = (coursesData.courses || []) as Course[];
      setCourses(teacherCourses);

      if (teacherCourses.length === 0) {
        setQuizzes([]);
        return;
      }

      const quizzesData = await listQuizzesAll();
      const allQuizzes: Quiz[] = (quizzesData.quizzes || []) as Quiz[];
      const courseIds = new Set(teacherCourses.map((c) => c._id));

      const teacherQuizzes = allQuizzes.filter((q) => {
        const quizCourseId =
          typeof q.course === 'object' && q.course !== null
            ? q.course._id?.toString()
            : q.course?.toString();
        return quizCourseId && courseIds.has(quizCourseId);
      });

      setQuizzes(teacherQuizzes);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('errors.errorLoadingQuizzes'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [session, status, router, fetchData]);

  const handleTogglePublish = useCallback(async (quizId: string, currentStatus: boolean) => {
    try {
      await patchQuiz(quizId, { isPublished: !currentStatus });
      setQuizzes((prev) =>
        prev.map((q) => (q._id === quizId ? { ...q, isPublished: !currentStatus } : q))
      );
    } catch (err) {
      setAlertState({
        type: 'error',
        message:
          err instanceof ApiClientError ? err.message : t('teacherQuizzes.errorUpdateQuiz'),
      });
    }
  }, [t]);

  const handleDelete = useCallback(async (quizId: string) => {
    if (!confirm(t('teacherQuizzes.confirmDeleteQuiz'))) return;

    try {
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err) {
      setAlertState({
        type: 'error',
        message:
          err instanceof ApiClientError ? err.message : t('teacherQuizzes.errorDeleteQuiz'),
      });
    }
  }, [t]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] truncate">{t('teacherQuizzes.quizManagement')}</h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--color-muted-foreground)]">{t('teacherQuizzes.quizManagementDesc')}</p>
        </div>
        <a
          href="/dashboard/teacher/quizzes/create"
          className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
        >
          {t('teacherQuizzes.createQuiz')}
        </a>
      </div>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {error && (
        <div className="bg-[var(--error-light)] border-l-4 border-[var(--error)] p-3 sm:p-4 rounded-r-lg">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      <div>
        {courses.length === 0 ? (
          <div className="bg-[var(--card-solid)] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-[var(--color-muted-foreground)] mb-4">{t('teacherQuizzes.createCourseFirst')}</p>
              <a
                href="/dashboard/teacher/courses/create"
                className={`inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:px-4 sm:py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 touch-manipulation`}
              >
                {t('teacherQuizzes.createCourse')}
              </a>
            </div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-[var(--card-solid)] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-[var(--color-muted-foreground)] mb-4">{t('teacherQuizzes.noQuizzesYet')}</p>
              <a
                href="/dashboard/teacher/quizzes/create"
                className={`inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:px-4 sm:py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 touch-manipulation`}
              >
                {t('teacherQuizzes.createFirstQuiz')}
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="bg-[var(--card-solid)] shadow rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[var(--color-foreground)] truncate">{quiz.title}</h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">{getCourseTitle(quiz.course)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                        quiz.isPublished
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                      }`}
                    >
                      {quiz.isPublished ? t('teacherQuizzes.published') : t('teacherQuizzes.draft')}
                    </span>
                  </div>

                  {quiz.description && (
                    <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2">{quiz.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)]">
                    <span>{quiz.questions?.length || 0} {t('teacherQuizzes.questions')}</span>
                    <span>{quiz.timeLimit} {t('teacherQuizzes.min')}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                    <button
                      onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                      className={`flex-1 min-h-[44px] sm:min-h-0 px-3 py-2 text-sm font-medium ${theme.text} ${theme.activeBg} rounded-lg hover:opacity-80 touch-manipulation`}
                    >
                      {quiz.isPublished ? t('teacherQuizzes.unpublish') : t('teacherQuizzes.publish')}
                    </button>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="min-h-[44px] sm:min-h-0 px-3 py-2 text-sm font-medium text-[var(--error)] bg-[var(--error-light)] rounded-lg hover:bg-[var(--error)]/20 touch-manipulation"
                    >
                      {t('teacherQuizzes.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-[var(--card-solid)] shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableQuiz')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableCourse')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableQuestions')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableTime')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableStatus')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--card-solid)] divide-y divide-[var(--border)]">
                  {quizzes.map((quiz) => (
                    <tr key={quiz._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--color-foreground)]">{quiz.title}</div>
                        {quiz.description && (
                          <div className="text-sm text-[var(--color-muted-foreground)] truncate max-w-xs">{quiz.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                        {getCourseTitle(quiz.course)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                        {quiz.questions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                        {quiz.timeLimit} {t('teacherQuizzes.min')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            quiz.isPublished
                              ? 'bg-[var(--success-light)] text-[var(--success)]'
                              : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                          }`}
                        >
                          {quiz.isPublished ? t('teacherQuizzes.published') : t('teacherQuizzes.draft')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                          className="text-[var(--teacher-primary)] hover:text-[var(--teacher-primary)]/80 mr-4"
                        >
                          {quiz.isPublished ? t('teacherQuizzes.unpublish') : t('teacherQuizzes.publish')}
                        </button>
                        <button
                          onClick={() => handleDelete(quiz._id)}
                          className="text-[var(--error)] hover:text-[var(--error)]/80"
                        >
                          {t('teacherQuizzes.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
