// src/app/(dashboard)/dashboard/teacher/analytics/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import Button from '@/components/ui/Button';
import { fetchAnalytics } from '@/lib/api/analytics';
import { getApiErrorMessage } from '@/lib/api/http';
import { PageWrapper } from '@/components/layout';
import type { TeacherStats } from './_components/types';
import TeacherAnalyticsHeader from './_components/TeacherAnalyticsHeader';
import TeacherAnalyticsStats from './_components/TeacherAnalyticsStats';
import TeacherAnalyticsCourses from './_components/TeacherAnalyticsCourses';
import TeacherAnalyticsTopStudents from './_components/TeacherAnalyticsTopStudents';

export default function TeacherAnalyticsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addAlert } = useAlert();
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const data = (await fetchAnalytics('teacher')) as { stats?: TeacherStats };
      setStats(data.stats || null);
    } catch (err) {
      setError(getApiErrorMessage(err, t('teacherAnalytics.errorLoading')));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }
    fetchStats();
  }, [session, status, router, fetchStats]);

  useEffect(() => {
    if (error) {
      addAlert({ type: 'error', message: error });
    }
  }, [error, addAlert]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  if (!stats) {
    return (
      <PageWrapper>
        <div className="teacher-panel text-center p-8 sm:p-12 max-w-lg mx-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]/25 mb-4 text-sm font-medium">
              {error}
            </div>
          )}
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] mb-1.5">
            {t('teacherAnalytics.errorLoading')}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-5">
            {t('errors.tryAgain')}
          </p>
          <Button onClick={fetchStats} variant="primary" className="min-h-[44px] rounded-xl px-6">
            {t('teacherAnalytics.retry')}
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header Banner with 3D Glass Score Metric */}
      <TeacherAnalyticsHeader averageScore={stats.overview?.averageScore ?? 0} />

      {/* 5 KPI Stats Strip */}
      <TeacherAnalyticsStats overview={stats.overview} />

      {/* Course Performance Breakdown */}
      <TeacherAnalyticsCourses courses={stats.courses || []} />

      {/* Top Students Leaderboard */}
      <TeacherAnalyticsTopStudents topStudents={stats.topStudents || []} />
    </PageWrapper>
  );
}
