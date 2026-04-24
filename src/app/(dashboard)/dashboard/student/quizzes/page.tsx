// src/app/(dashboard)/dashboard/student/quizzes/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import QuizCard from '@/features/quizzes/components/QuizCard';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { useCachedStore } from '@/store/useCachedStore';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import type { QuizAttempt, Quiz } from '@/store/useCachedStore';

export default function StudentQuizzesPage() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const { enrollments: enrollmentsCache, quizAttempts: quizAttemptsCache, fetchEnrollments, fetchQuizAttempts } = useCachedStore();
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const userId = session?.user?.id;
  const enrollmentState = userId ? enrollmentsCache[userId] : null;
  const attemptsState = userId ? quizAttemptsCache[userId] : null;
  const enrollments = useMemo(() => enrollmentState?.data || [], [enrollmentState?.data]);
  const attempts = useMemo(() => attemptsState?.data || [], [attemptsState?.data]);
  const isLoading = (enrollmentState?.loading ?? true) || (attemptsState?.loading ?? true);
  const error = enrollmentState?.error || attemptsState?.error || '';

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    if (userId) {
      fetchEnrollments(userId);
      fetchQuizAttempts(userId);
    }
  }, [session, status, userId, fetchEnrollments, fetchQuizAttempts, router]);

  // Derive available quizzes from enrollments
  useEffect(() => {
    const fetchAvailableQuizzes = async () => {
      if (enrollments.length === 0) {
        setAvailableQuizzes([]);
        return;
      }

      const enrolledCourseIds = enrollments.map(
        (e: { course: { _id: string } | string }) => {
          if (typeof e.course === 'object' && e.course !== null) {
            return e.course._id?.toString();
          }
          return e.course?.toString();
        }
      ).filter(Boolean);

      try {
        // Fetch all available quizzes
        const quizzesRes = await fetch('/api/quizzes');
        const quizzesData = await quizzesRes.json();

        if (!quizzesRes.ok) {
          setAlertState({ type: 'error', message: t('errors.failedLoadQuizzes') || 'Failed to load quizzes' });
          return;
        }

        const allQuizzes = quizzesData.quizzes || [];

        // Filter for published quizzes from enrolled courses that haven't been completed
        const relevantQuizzes = allQuizzes.filter((q: Quiz) => {
          const quizCourseId = q.course?._id?.toString();
          const isEnrolled = quizCourseId && enrolledCourseIds.includes(quizCourseId);
          
          // Check if quiz has been completed
          const isCompleted = attempts.some(
            (a: QuizAttempt) => a.quiz?._id === q._id && a.status === 'completed'
          );
          
          return q.isPublished && isEnrolled && !isCompleted;
        });

        setAvailableQuizzes(relevantQuizzes);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      }
    };

    fetchAvailableQuizzes();
  }, [enrollments, attempts]);

  const handleStartQuiz = useCallback(async (quizId: string) => {
    console.log('Starting quiz with ID:', quizId);
    try {
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, action: 'start' }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to quiz taking page
        router.push(`/dashboard/student/quizzes/take?attemptId=${data.attempt._id}`);
      } else {
        console.error('Failed to start quiz:', data);
        setAlertState({ type: 'error', message: data.message || t('errors.failedStartQuiz') });
      }
    } catch {
      setAlertState({ type: 'error', message: t('errors.errorStartingQuiz') });
    }
  }, [t, router]);

  const completedAttempts = useMemo(() =>
    attempts.filter((a) => a.status === 'completed'),
    [attempts]
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Quiz cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('quiz.myQuizzes')}</h1>
      <p className="mt-2 text-gray-600">
        {t('quiz.quizzesDesc')}
      </p>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`${
              activeTab === 'available'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            {t('quiz.available')} ({availableQuizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${
              activeTab === 'completed'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            {t('quiz.completed')} ({completedAttempts.length})
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'available' ? (
          availableQuizzes.length === 0 ? (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-8 sm:p-6 text-center">
                <p className="text-gray-500 mb-4">
                  {t('quiz.enrollCourse')}
                </p>
                <a
                  href="/dashboard/student/browse"
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
                >
                  {t('courses.browseMore')}
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz._id}
                  quiz={quiz}
                  type="available"
                  onStart={handleStartQuiz}
                />
              ))}
            </div>
          )
        ) : completedAttempts.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-gray-500">{t('quiz.noCompleted')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedAttempts.map((attempt) => (
              <QuizCard
                key={`${attempt._id}-${attempt.attemptNumber}`}
                quiz={attempt.quiz}
                attempt={attempt}
                type="attempted"
                onStart={handleStartQuiz}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
