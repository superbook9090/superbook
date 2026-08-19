'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { Users, BookOpen, Layers, HelpCircle } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveGrid } from '@/components/layout';
import type { AdminStats } from './types';

interface AdminStatsGridProps {
  stats: AdminStats | null;
  isLoading: boolean;
}

export default function AdminStatsGrid({ stats, isLoading }: AdminStatsGridProps) {
  const { t } = useTranslation();

  if (isLoading || !stats) {
    return (
      <ResponsiveGrid variant="stats">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-[var(--card-solid)] border border-[var(--color-border)] p-4 h-28 animate-pulse"
          >
            <div className="h-4 bg-[var(--color-surface-muted-strong)] rounded w-1/3 mb-3" />
            <div className="h-7 bg-[var(--color-surface-muted-strong)] rounded w-1/2" />
          </div>
        ))}
      </ResponsiveGrid>
    );
  }

  const usersCount = stats.users?.total || 0;
  const newUsersThisMonth = stats.users?.newThisMonth || 0;
  const coursesCount = stats.courses?.total || 0;
  const publishedCourses = stats.courses?.published || 0;
  const enrollmentsCount = stats.enrollments?.total || 0;
  const activeEnrollments = stats.enrollments?.active || 0;
  const quizAttempts = stats.quizzes?.totalAttempts || 0;
  const avgQuizScore = stats.quizzes?.averageScore || 0;

  return (
    <ResponsiveGrid variant="stats">
      <StatCard
        icon={Users}
        value={usersCount}
        label={t('dashboard.totalPlatformUsers')}
        color="info"
        delay={0.1}
        description={newUsersThisMonth > 0 ? `+${newUsersThisMonth} ${t('dashboard.newUsersMonth')}` : undefined}
      />

      <StatCard
        icon={BookOpen}
        value={coursesCount}
        label={t('admin.totalCourses')}
        color="teacher"
        delay={0.15}
        description={`${publishedCourses} ${t('dashboard.published')}`}
      />

      <StatCard
        icon={Layers}
        value={enrollmentsCount}
        label={t('dashboard.activeEnrollments')}
        color="success"
        delay={0.2}
        description={`${activeEnrollments} ${t('common.active') || 'active'}`}
      />

      <StatCard
        icon={HelpCircle}
        value={quizAttempts}
        label={t('dashboard.totalAttempts')}
        color="warning"
        delay={0.25}
        description={avgQuizScore > 0 ? `${t('dashboard.averageScore')}: ${avgQuizScore}%` : undefined}
      />
    </ResponsiveGrid>
  );
}
