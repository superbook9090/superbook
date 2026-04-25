// src/app/(dashboard)/dashboard/student/quizzes/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import QuizCard from '@/features/quizzes/components/QuizCard';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { useEnrollments, useQuizAttempts, useQuizzes, type QuizAttempt, type Quiz } from '@/lib/react-query/hooks';

export default function StudentQuizzesPage() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: enrollments = [] } = useEnrollments();
  const { data: attempts = [] } = useQuizAttempts();
  const { data: allQuizzes = [], isLoading: quizzesLoading } = useQuizzes(orgId);
  const isLoading = quizzesLoading;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [status, session, router]);

  // Derive available quizzes from enrollments using useMemo
  const availableQuizzes = useMemo(() => {
    if (enrollments.length === 0) {
      return [];
    }

    const enrolledCourseIds = enrollments.map(
      (e: { course: { _id: string } | string }) => {
        if (typeof e.course === 'object' && e.course !== null) {
          return e.course._id?.toString();
        }
        return e.course?.toString();
      }
    ).filter(Boolean);

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

    return relevantQuizzes;
  }, [enrollments, attempts, allQuizzes]);

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
    attempts.filter((a: QuizAttempt) => a.status === 'completed'),
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
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] truncate">{t('quiz.myQuizzes')}</h1>
      <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
        {t('quiz.quizzesDesc')}
      </p>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {/* Tabs */}
      <div className="mt-6 border-b border-[var(--border)]">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('available')}
            className={`${
              activeTab === 'available'
                ? 'border-[var(--success)] text-[var(--success)]'
                : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--border)]'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm min-h-[44px] flex items-center`}
          >
            {t('quiz.available')} ({availableQuizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${
              activeTab === 'completed'
                ? 'border-[var(--success)] text-[var(--success)]'
                : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--border)]'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm min-h-[44px] flex items-center`}
          >
            {t('quiz.completed')} ({completedAttempts.length})
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'available' ? (
          availableQuizzes.length === 0 ? (
            <div className="bg-[var(--background)] overflow-hidden shadow rounded-lg">
              <div className="px-4 py-8 sm:p-6 text-center">
                <p className="text-[var(--color-muted-foreground)] mb-4">
                  {t('quiz.enrollCourse')}
                </p>
                <a
                  href="/dashboard/student/browse"
                  className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
                >
                  {t('courses.browseMore')}
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableQuizzes.map((quiz: Quiz) => (
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
              <p className="text-[var(--color-muted-foreground)]">{t('quiz.noCompleted')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedAttempts.map((attempt: QuizAttempt) => (
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
