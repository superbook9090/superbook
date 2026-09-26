'use client';

import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/hooks/useTranslation';
import StatCard from '@/components/ui/StatCard';
import { AdminOverviewHighlights } from './AdminOverviewHighlights';
import type { AdminStats } from './types';

const AdminActivityChart = dynamic(
  () => import('./AdminActivityChart').then((m) => m.AdminActivityChart),
  { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] animate-pulse" /> }
);
const AdminPlatformDistributionChart = dynamic(
  () => import('./AdminPlatformDistributionChart').then((m) => m.AdminPlatformDistributionChart),
  { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] animate-pulse" /> }
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 sm:space-y-6 w-full min-w-0"
    >
      {/* Top 6 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 w-full min-w-0">
        <StatCard
          icon={Users}
          value={stats.users.total}
          label={t('adminAnalytics.totalUsers')}
          color="info"
          delay={0.05}
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
          color="success"
          delay={0.1}
          description={`${stats.courses.published} ${t('adminAnalytics.published')}`}
        />
        <StatCard
          icon={Users}
          value={stats.enrollments.total}
          label={t('adminAnalytics.totalEnrollments')}
          color="student"
          delay={0.15}
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
          delay={0.25}
          showProgress={true}
          progress={completionRate}
        />
      </div>

      {/* Main Charts & Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
        <div className="lg:col-span-2 w-full min-w-0">
          <AdminActivityChart data={stats.trends || []} />
        </div>
        <div className="lg:col-span-1 w-full min-w-0">
          <AdminPlatformDistributionChart
            platformStats={stats.platformStats}
            totalUsers={stats.users.total}
          />
        </div>
      </div>

      {/* Highlights & Quick Links Row */}
      <AdminOverviewHighlights stats={stats} completionRate={completionRate} />
    </motion.div>
  );
}
