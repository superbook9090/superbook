// src/app/(dashboard)/dashboard/student/quizzes/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { LazyQuizCard } from '@/lib/lazy';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useStartQuizAttempt, useEnrollments, useQuizAttempts, useQuizzes, type QuizAttempt, type Quiz } from '@/lib/react-query/hooks';
import { BookOpen, Trophy } from 'lucide-react';
import { ApiClientError } from '@/lib/api/http';
import { Dropdown } from '@/components/ui/Dropdown';
import { PageWrapper, PageHeader, ResponsiveGrid } from '@/components/layout';
import { useFeature } from '@/contexts/AppSettingsContext';

export default function StudentQuizzesPage() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const enableContests = useFeature('enableContests');
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
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [courseFilterInitialized, setCourseFilterInitialized] = useState(false);

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: enrollments = [] } = useEnrollments();
  const { data: attempts = [] } = useQuizAttempts();
  const { data: allQuizzes = [], isLoading: quizzesLoading } = useQuizzes(orgId);
  const isLoading = quizzesLoading;

  const startQuiz = useStartQuizAttempt();

  // Default to the most recently enrolled course once enrollments load
  useEffect(() => {
    if (courseFilterInitialized || enrollments.length === 0) return;
    const latest = [...enrollments].sort(
      (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
    )[0];
    const latestCourseId = latest.course?._id?.toString();
    if (latestCourseId) {
      setSelectedCourse(latestCourseId);
      setCourseFilterInitialized(true);
    }
  }, [courseFilterInitialized, enrollments]);

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

    const courseMatches = (courseId: string | undefined) =>
      selectedCourse === 'all' || courseId === selectedCourse;

    // Filter for published quizzes from enrolled courses that haven't been completed
    const relevantQuizzes = allQuizzes.filter((q: Quiz) => {
      const quizCourseId = q.course?._id?.toString();
      const isEnrolled = quizCourseId && enrolledCourseIds.includes(quizCourseId);
      const matchesCourse = courseMatches(quizCourseId);

      // Check if quiz has been completed
      const isCompleted = attempts.some(
        (a) => a.quiz?._id === q._id && a.status === 'completed'
      );

      return q.isPublished && isEnrolled && matchesCourse && !isCompleted;
    });

    // Sort by creation date (first created first)
    return relevantQuizzes.sort((a: Quiz, b: Quiz) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
  }, [enrollments, attempts, allQuizzes, selectedCourse]);

  const handleStartQuiz = useCallback(
    async (quizId: string) => {
      try {
        const data = await startQuiz.mutateAsync(quizId);
        router.push(ROUTES.student.quizTake(data.attempt._id));
      } catch (e) {
        const message =
          e instanceof ApiClientError ? e.message : t('errors.errorStartingQuiz');
        addAlert({ type: 'error', message: message || t('errors.failedStartQuiz'), duration: 5000 });
      }
    },
    [startQuiz, router, t, addAlert]
  );

  const completedAttempts = useMemo(() => {
    const filtered = attempts.filter((a) => {
      let quizCourseId: string | undefined;
      if (a.quiz?.course) {
        if (typeof a.quiz.course === 'object' && a.quiz.course !== null) {
          quizCourseId = a.quiz.course._id?.toString();
        } else {
          quizCourseId = String(a.quiz.course);
        }
      }
      const matchesCourse = selectedCourse === 'all' || quizCourseId === selectedCourse;
      return a.status === 'completed' && matchesCourse;
    });

    // Sort by latest attempted first (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.startedAt).getTime();
      const dateB = new Date(b.submittedAt || b.startedAt).getTime();
      return dateB - dateA;
    });
  }, [attempts, selectedCourse]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <PageHeader
        title={t('quiz.myQuizzes')}
        description={t('quiz.quizzesDesc')}
        actions={
          enableContests ? (
            <Link href={ROUTES.student.contests} className="btn-primary inline-flex items-center gap-2 px-4 py-2 bg-[var(--student-primary)] text-white rounded-lg hover:bg-[var(--student-primary)]/90 transition-colors">
              <Trophy className="w-4 h-4" />
              <span className="font-semibold text-sm">{t('common.contests') || 'Live Contests'}</span>
            </Link>
          ) : null
        }
      />

      {/* Tabs and Course Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 sm:pb-0">
        <div className="antigravity-tab-group overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('available')}
            className={`antigravity-tab-btn ${activeTab === 'available' ? 'antigravity-tab-btn--active' : ''}`}
          >
            <span>{t('quiz.available')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-[var(--student-primary)]/15 text-[var(--student-primary)]">
              {availableQuizzes.length}
            </span>
          </button>
          <button
            onClick={() => handleTabChange('completed')}
            className={`antigravity-tab-btn ${activeTab === 'completed' ? 'antigravity-tab-btn--active' : ''}`}
          >
            <span>{t('quiz.completed')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-[var(--student-primary)]/15 text-[var(--student-primary)]">
              {completedAttempts.length}
            </span>
          </button>
        </div>

        {enrollments.length > 0 && (
          <div className="w-full sm:w-64">
            <Dropdown
              id="course-filter"
              startIcon={<BookOpen className="w-4 h-4" />}
              value={selectedCourse}
              onChange={(val) => setSelectedCourse(val)}
              options={[
                { value: 'all', label: t('teacherQuizzes.allCourses') },
                ...enrollments
                  .map((enrollment) => {
                    const course =
                      typeof enrollment.course === 'object' && enrollment.course !== null
                        ? enrollment.course
                        : null;
                    if (!course) return null;
                    return { value: course._id.toString(), label: course.title };
                  })
                  .filter((item): item is { value: string; label: string } => item !== null),
              ]}
              placeholder={t('teacherQuizzes.allCourses')}
            />
          </div>
        )}
      </div>

      <div className="perspective-1000">
        {activeTab === 'available' ? (
          availableQuizzes.length === 0 ? (
            <div className="antigravity-glass rounded-3xl p-8 sm:p-12 text-center border border-dashed border-[var(--border)]">
              <div className="w-16 h-16 rounded-2xl bg-[var(--student-primary)]/10 text-[var(--student-primary)] flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-[var(--color-foreground)] mb-1">
                {t('quiz.enrollCourse')}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] mb-6 max-w-sm mx-auto">
                Join a course to unlock curated quizzes and skill assessments.
              </p>
              <Link href={ROUTES.student.browse} className="btn-premium inline-flex items-center min-h-[44px]">
                {t('courses.browseMore')}
              </Link>
            </div>
          ) : (
            <ResponsiveGrid variant="dense">
              {availableQuizzes.map((quiz: Quiz) => (
                <div key={quiz._id} className="min-w-0 transform-3d">
                  <LazyQuizCard quiz={quiz} type="available" onStart={handleStartQuiz} />
                </div>
              ))}
            </ResponsiveGrid>
          )
        ) : completedAttempts.length === 0 ? (
          <div className="antigravity-glass rounded-3xl p-8 sm:p-12 text-center border border-dashed border-[var(--border)]">
            <p className="text-[var(--color-muted-foreground)]">{t('quiz.noCompleted')}</p>
          </div>
        ) : (
          <ResponsiveGrid variant="dense">
            {completedAttempts.map((attempt: QuizAttempt) => (
              <div key={attempt._id} className="h-full min-w-0 transform-3d">
                <LazyQuizCard quiz={attempt.quiz} attempt={attempt} type="attempted" onStart={handleStartQuiz} />
              </div>
            ))}
          </ResponsiveGrid>
        )}
      </div>
    </PageWrapper>
  );
}
