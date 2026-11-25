// src/app/(dashboard)/dashboard/student/quizzes/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Trophy, HelpCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useUrlTab, useUrlParam } from '@/hooks/useUrlTab';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { LazyQuizCard } from '@/lib/lazy';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import {
  useStartQuizAttempt,
  useEnrollments,
  useQuizAttempts,
  useQuizzes,
  type QuizAttempt,
  type Quiz,
} from '@/lib/react-query/hooks';
import { ApiClientError } from '@/lib/api/http';
import { Dropdown } from '@/components/ui/Dropdown';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import { useFeature } from '@/contexts/AppSettingsContext';
import { StudentPageBanner } from '@/features/student/components/StudentPageBanner';
import { StudentTabs } from '@/features/student/components/StudentTabs';

export default function StudentQuizzesPage() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const enableContests = useFeature('enableContests');
  const searchParams = useSearchParams();
  const [activeTab, handleTabChange] = useUrlTab<'available' | 'completed'>(
    ['available', 'completed'],
    'available'
  );
  const [selectedCourseParam, setSelectedCourse] = useUrlParam('course', '');
  const selectedCourse = selectedCourseParam || 'all';
  const [courseFilterInitialized, setCourseFilterInitialized] = useState(() =>
    Boolean(searchParams.get('course'))
  );

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: enrollments = [] } = useEnrollments();
  const { data: attempts = [] } = useQuizAttempts();
  const { data: allQuizzes = [], isLoading } = useQuizzes(orgId);
  const startQuiz = useStartQuizAttempt();

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
  }, [courseFilterInitialized, enrollments, setSelectedCourse]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push(ROUTES.login);
  }, [status, session, router]);

  const availableQuizzes = useMemo(() => {
    if (enrollments.length === 0) return [];
    const enrolledCourseIds = enrollments
      .map((e: { course: { _id: string } | string }) =>
        typeof e.course === 'object' && e.course !== null ? e.course._id?.toString() : e.course?.toString()
      )
      .filter(Boolean);

    return allQuizzes
      .filter((q: Quiz) => {
        const quizCourseId = q.course?._id?.toString();
        const isEnrolled = quizCourseId && enrolledCourseIds.includes(quizCourseId);
        const matchesCourse = selectedCourse === 'all' || quizCourseId === selectedCourse;
        const isCompleted = attempts.some((a) => a.quiz?._id === q._id && a.status === 'completed');
        return q.isPublished && isEnrolled && matchesCourse && !isCompleted;
      })
      .sort((a: Quiz, b: Quiz) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [enrollments, attempts, allQuizzes, selectedCourse]);

  const completedAttempts = useMemo(() => {
    return attempts
      .filter((a) => {
        const raw = a.quiz?.course;
        const quizCourseId =
          raw && typeof raw === 'object' ? raw._id?.toString() : raw ? String(raw) : undefined;
        const matchesCourse = selectedCourse === 'all' || quizCourseId === selectedCourse;
        return a.status === 'completed' && matchesCourse;
      })
      .sort(
        (a, b) =>
          new Date(b.submittedAt || b.startedAt).getTime() -
          new Date(a.submittedAt || a.startedAt).getTime()
      );
  }, [attempts, selectedCourse]);

  const handleStartQuiz = useCallback(
    async (quizId: string) => {
      try {
        const data = await startQuiz.mutateAsync(quizId);
        router.push(ROUTES.student.quizTake(data.attempt._id));
      } catch (e) {
        const message = e instanceof ApiClientError ? e.message : t('errors.errorStartingQuiz');
        addAlert({ type: 'error', message: message || t('errors.failedStartQuiz'), duration: 5000 });
      }
    },
    [startQuiz, router, t, addAlert]
  );

  if (status === 'loading' || isLoading) return <PageSkeleton />;

  return (
    <PageWrapper>
      <StudentPageBanner
        icon={HelpCircle}
        eyebrow={t('common.quizzes')}
        title={t('quiz.myQuizzes')}
        description={t('quiz.quizzesDesc')}
        actions={
          enableContests ? (
            <Link href={ROUTES.student.contests} className="student-cta-btn w-full sm:w-auto">
              <Trophy className="w-4 h-4" />
              <span>{t('common.contests')}</span>
            </Link>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StudentTabs
          activeTab={activeTab}
          onChange={handleTabChange}
          tabs={[
            {
              id: 'available',
              label: t('quiz.available'),
              icon: <Sparkles className="w-4 h-4" />,
              count: availableQuizzes.length,
            },
            {
              id: 'completed',
              label: t('quiz.completed'),
              icon: <CheckCircle2 className="w-4 h-4" />,
              count: completedAttempts.length,
              tone: 'success',
            },
          ]}
        />

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
                    return course ? { value: course._id.toString(), label: course.title } : null;
                  })
                  .filter((item): item is { value: string; label: string } => item !== null),
              ]}
              placeholder={t('teacherQuizzes.allCourses')}
            />
          </div>
        )}
      </div>

      {activeTab === 'available' ? (
        availableQuizzes.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t('quiz.enrollCourse')}
            description={t('studentUi.enrollUnlockQuizzes')}
            action={
              <Link href={ROUTES.student.browse} className="student-cta-btn">
                {t('courses.browseMore')}
              </Link>
            }
          />
        ) : (
          <ResponsiveGrid variant="dense">
            {availableQuizzes.map((quiz: Quiz) => (
              <div key={quiz._id} className="min-w-0">
                <LazyQuizCard quiz={quiz} type="available" onStart={handleStartQuiz} />
              </div>
            ))}
          </ResponsiveGrid>
        )
      ) : completedAttempts.length === 0 ? (
        <EmptyState icon={CheckCircle2} title={t('quiz.noCompleted')} />
      ) : (
        <ResponsiveGrid variant="dense">
          {completedAttempts.map((attempt: QuizAttempt) => (
            <div key={attempt._id} className="h-full min-w-0">
              <LazyQuizCard
                quiz={attempt.quiz}
                attempt={attempt}
                type="attempted"
                onStart={handleStartQuiz}
              />
            </div>
          ))}
        </ResponsiveGrid>
      )}
    </PageWrapper>
  );
}
