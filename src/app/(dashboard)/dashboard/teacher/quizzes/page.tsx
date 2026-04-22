// src/app/(dashboard)/dashboard/teacher/quizzes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import Alert from '@/components/ui/Alert';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';

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

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      // Fetch teacher's courses first
      const coursesRes = await fetch('/api/courses?instructor=self');
      const coursesData = await coursesRes.json();

      if (!coursesRes.ok) {
        setError(coursesData.message || 'Failed to load courses');
        setIsLoading(false);
        return;
      }

      const teacherCourses: Course[] = coursesData.courses || [];
      setCourses(teacherCourses);

      if (teacherCourses.length === 0) {
        setQuizzes([]);
        setIsLoading(false);
        return;
      }

      // Fetch all quizzes and filter for teacher's courses
      const quizzesRes = await fetch('/api/quizzes');
      const quizzesData = await quizzesRes.json();

      if (quizzesRes.ok) {
        const allQuizzes: Quiz[] = quizzesData.quizzes || [];
        const courseIds = new Set(teacherCourses.map((c) => c._id));

        // Filter quizzes for this teacher's courses
        const teacherQuizzes = allQuizzes.filter((q) => {
          const quizCourseId = typeof q.course === 'object' && q.course !== null
            ? q.course._id?.toString()
            : q.course?.toString();
          return quizCourseId && courseIds.has(quizCourseId);
        });

        setQuizzes(teacherQuizzes);
      } else {
        setError(quizzesData.message || 'Failed to load quizzes');
      }
    } catch {
      setError('Error loading quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = useCallback(async (quizId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        setQuizzes(prev => prev.map((q) =>
          q._id === quizId ? { ...q, isPublished: !currentStatus } : q
        ));
      } else {
        setAlertState({ type: 'error', message: t('teacherQuizzes.failedUpdateQuiz') });
      }
    } catch {
      setAlertState({ type: 'error', message: t('teacherQuizzes.errorUpdateQuiz') });
    }
  }, [t]);

  const handleDelete = useCallback(async (quizId: string) => {
    if (!confirm(t('teacherQuizzes.confirmDeleteQuiz'))) return;

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuizzes(prev => prev.filter((q) => q._id !== quizId));
      } else {
        setAlertState({ type: 'error', message: t('teacherQuizzes.failedDeleteQuiz') });
      }
    } catch {
      setAlertState({ type: 'error', message: t('teacherQuizzes.errorDeleteQuiz') });
    }
  }, [t]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Quiz cards skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('teacherQuizzes.quizManagement')}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('teacherQuizzes.quizManagementDesc')}</p>
        </div>
        <a
          href="/dashboard/teacher/quizzes/create"
          className={`inline-flex items-center justify-center px-4 py-2.5 sm:py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 touch-manipulation`}
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
        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-r-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        {courses.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-gray-500 mb-4">{t('teacherQuizzes.createCourseFirst')}</p>
              <a
                href="/dashboard/teacher/courses/create"
                className={`inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 touch-manipulation`}
              >
                {t('teacherQuizzes.createCourse')}
              </a>
            </div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-gray-500 mb-4">{t('teacherQuizzes.noQuizzesYet')}</p>
              <a
                href="/dashboard/teacher/quizzes/create"
                className={`inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 touch-manipulation`}
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
                <div key={quiz._id} className="bg-white shadow rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{quiz.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{getCourseTitle(quiz.course)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                        quiz.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {quiz.isPublished ? t('teacherQuizzes.published') : t('teacherQuizzes.draft')}
                    </span>
                  </div>

                  {quiz.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{quiz.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{quiz.questions?.length || 0} {t('teacherQuizzes.questions')}</span>
                    <span>{quiz.timeLimit} {t('teacherQuizzes.min')}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                      className={`flex-1 px-3 py-2 text-sm font-medium ${theme.text} ${theme.activeBg} rounded-lg hover:opacity-80 touch-manipulation`}
                    >
                      {quiz.isPublished ? t('teacherQuizzes.unpublish') : t('teacherQuizzes.publish')}
                    </button>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 touch-manipulation"
                    >
                      {t('teacherQuizzes.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('teacherQuizzes.tableQuiz')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('teacherQuizzes.tableCourse')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('teacherQuizzes.tableQuestions')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('teacherQuizzes.tableTime')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('teacherQuizzes.tableStatus')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('teacherQuizzes.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizzes.map((quiz) => (
                    <tr key={quiz._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        {quiz.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{quiz.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCourseTitle(quiz.course)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quiz.questions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quiz.timeLimit} {t('teacherQuizzes.min')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            quiz.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {quiz.isPublished ? t('teacherQuizzes.published') : t('teacherQuizzes.draft')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          {quiz.isPublished ? t('teacherQuizzes.unpublish') : t('teacherQuizzes.publish')}
                        </button>
                        <button
                          onClick={() => handleDelete(quiz._id)}
                          className="text-red-600 hover:text-red-900"
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
