'use client';

import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/hooks/useTranslation';
import StatCard from '@/components/ui/StatCard';
import { AdminOverviewHighlights } from './AdminOverviewHighlights';
import { AdminFunnelChart } from './AdminFunnelChart';
import type { AdminStats } from './types';

const AdminActivityChart = dynamic(
  () => import('./AdminActivityChart').then((m) => m.AdminActivityChart),
  { ssr: false, loading: () => <div className="h-[340px] teacher-panel animate-pulse" /> }
);
const AdminPlatformDistributionChart = dynamic(
  () => import('./AdminPlatformDistributionChart').then((m) => m.AdminPlatformDistributionChart),
  { ssr: false, loading: () => <div className="h-[340px] teacher-panel animate-pulse" /> }
);
const AdminScoreDistributionChart = dynamic(
  () => import('./AdminScoreDistributionChart').then((m) => m.AdminScoreDistributionChart),
  { ssr: false, loading: () => <div className="h-[310px] teacher-panel animate-pulse" /> }
);

interface AdminOverviewTabProps {
  stats: AdminStats;
}

export function AdminOverviewTab({ stats }: AdminOverviewTabProps) {
  const { t } = useTranslation();

  const completionRate =
    stats.enrollments.total > 0
      ? Math.round((stats.enrollments.completed / stats.enrollments.total) * 100)
      : 0;

  return (
    <div className="space-y-4 sm:space-y-5 w-full min-w-0">
      {/* Executive KPI Bento */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
        <StatCard
          icon={Users}
          value={stats.users.total}
          label={t('adminAnalytics.totalUsers')}
          color="info"
          delay={0.04}
          description={
            stats.users.newThisMonth > 0
              ? `+${stats.users.newThisMonth} ${t('adminAnalytics.newThisMonth')}`
              : undefined
          }
        />
        <StatCard
          icon={TrendingUp}
          value={stats.activeUsers?.dau ?? 0}
          label={t('adminAnalytics.activeToday')}
          color="student"
          delay={0.08}
          description={
            stats.platformStats
              ? `${stats.platformStats.appPercentage}% ${t('adminAnalytics.platformApp')}`
              : undefined
          }
        />
        <StatCard
          icon={BookOpen}
          value={stats.courses.total}
          label={t('adminAnalytics.totalCourses')}
          color="teacher"
          delay={0.12}
          description={`${stats.courses.published} ${t('adminAnalytics.published')}`}
        />
        <StatCard
          icon={GraduationCap}
          value={stats.enrollments.total}
          label={t('adminAnalytics.totalEnrollments')}
          color="info"
          delay={0.16}
          description={`${stats.enrollments.active} ${t('adminAnalytics.activeEnrollments')}`}
        />
        <StatCard
          icon={Award}
          value={stats.quizzes.totalAttempts}
          label={t('adminAnalytics.totalAttempts')}
          color="warning"
          delay={0.2}
          description={
            stats.quizzes.averageScore > 0
              ? `${t('adminAnalytics.avgScore')}: ${stats.quizzes.averageScore}%`
              : undefined
          }
        />
        <StatCard
          icon={CheckCircle2}
          value={completionRate}
          suffix="%"
          label={t('adminAnalytics.completionRate')}
          color="success"
          delay={0.24}
          showProgress
          progress={completionRate}
        />
      </div>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
        <div className="xl:col-span-2 w-full min-w-0">
          <AdminActivityChart data={stats.trends || []} />
        </div>
        <div className="xl:col-span-1 w-full min-w-0">
          <AdminPlatformDistributionChart
            platformStats={stats.platformStats}
            totalUsers={stats.users.total}
          />
        </div>
      </div>

      {/* Funnel & Score Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
        <AdminFunnelChart funnel={stats.funnel} />
        <AdminScoreDistributionChart
          data={stats.scoreDistribution}
          scoreTiers={stats.scoreTiers}
        />
      </div>

      {/* Highlights & Quick Links */}
      <AdminOverviewHighlights stats={stats} completionRate={completionRate} />
    </div>
  );
}
