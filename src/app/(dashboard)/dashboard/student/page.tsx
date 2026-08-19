// src/app/(dashboard)/dashboard/student/page.tsx
'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboard, isStudentDashboard } from '@/lib/react-query/hooks';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSessionStore } from '@/store/useSessionStore';
import { PageWrapper } from '@/components/layout';
import StudentHero from './_components/StudentHero';
import StudentStats from './_components/StudentStats';
import ContinueLearning from './_components/ContinueLearning';
import StudentQuickLinks from './_components/StudentQuickLinks';
import StudentActivity from './_components/StudentActivity';
import type { Enrollment, Attempt, StudentStatsData } from './_components/types';

export default function StudentDashboardPage() {
  const session = useSessionStore((s) => s.session) as { user?: { name?: string } };
  const { t } = useTranslation();
  const { data, isLoading, error } = useDashboard();
  const { addAlert } = useAlert();

  const dashboardData = data && isStudentDashboard(data) ? data : null;
  const enrollments: Enrollment[] = dashboardData?.enrollments || [];
  const attempts: Attempt[] = dashboardData?.quizAttempts || [];
  const stats: StudentStatsData = dashboardData?.stats || {
    enrolledCount: 0,
    completedQuizzes: 0,
    averageScore: 0,
  };

  useEffect(() => {
    if (error) {
      addAlert({
        type: 'error',
        message: error.message || t('errors.failedLoadDashboardData'),
      });
    }
  }, [error, addAlert, t]);

  if (error) {
    return (
      <PageWrapper>
        <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20">
          {error.message || t('errors.failedLoadDashboardData')}
        </div>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper className="space-y-6">
      <StudentHero
        userName={session?.user?.name}
        enrolledCount={stats.enrolledCount}
      />

      <StudentStats stats={stats} />

      <ContinueLearning enrollments={enrollments} />

      <StudentQuickLinks />

      <StudentActivity
        enrollments={enrollments}
        attempts={attempts}
      />
    </PageWrapper>
  );
}