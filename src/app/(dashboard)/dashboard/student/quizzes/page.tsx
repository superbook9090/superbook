// src/app/(dashboard)/dashboard/student/quizzes/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { LazyQuizCard } from '@/lib/lazy';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useStartQuizAttempt, useEnrollments, useQuizAttempts, useQuizzes, type QuizAttempt, type Quiz } from '@/lib/react-query/hooks';
import { ApiClientError } from '@/lib/api/http';

export default function StudentQuizzesPage() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'completed' ? 'completed' : 'available';
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>(initialTab);

  const handleTabChange = (tab: 'available' | 'completed') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: enrollments = [] } = useEnrollments();
  const { data: attempts = [] } = useQuizAttempts();
  const { data: allQuizzes = [], isLoading: quizzesLoading } = useQuizzes(orgId);
  const isLoading = quizzesLoading;

  const startQuiz = useStartQuizAttempt();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
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

  const handleStartQuiz = useCallback(
    async (quizId: string) => {
      try {
        const data = await startQuiz.mutateAsync(quizId);
        router.push(ROUTES.student.quizTake(data.attempt._id));
      } catch (e) {
        const message =
          e instanceof ApiClientError ? e.message : t('errors.errorStartingQuiz');
        setAlertState({ type: 'error', message: message || t('errors.failedStartQuiz') });
      }
    },
    [startQuiz, router, t]
  );

  const completedAttempts = useMemo(() =>
    attempts.filter((a: QuizAttempt) => a.status === 'completed'),
    [attempts]
  );

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
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
            onClick={() => handleTabChange('available')}
            className={`${
              activeTab === 'available'
                ? 'border-[var(--success)] text-[var(--success)]'
                : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--border)]'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm min-h-[44px] flex items-center`}
          >
            {t('quiz.available')} ({availableQuizzes.length})
          </button>
          <button
            onClick={() => handleTabChange('completed')}
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
                <Link
                  href={ROUTES.student.browse}
                  className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
                >
                  {t('courses.browseMore')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {availableQuizzes.map((quiz: Quiz) => (
                <div key={quiz._id} className="min-w-0">
                  <LazyQuizCard
                    quiz={quiz}
                    type="available"
                    onStart={handleStartQuiz}
                  />
                </div>
              ))}
            </div>
          )
        ) : completedAttempts.length === 0 ? (
          <div className="bg-[var(--card-solid)] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-[var(--color-muted-foreground)]">{t('quiz.noCompleted')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {completedAttempts.map((attempt: QuizAttempt) => (
              <div key={`${attempt._id}-${attempt.attemptNumber}`} className="h-full min-w-0">
                <LazyQuizCard
                  quiz={attempt.quiz}
                  attempt={attempt}
                  type="attempted"
                  onStart={handleStartQuiz}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
