'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveGrid } from '@/components/layout';
import type { StudentStatsData } from './types';

interface StudentStatsProps {
  stats: StudentStatsData;
}

export default function StudentStats({ stats }: StudentStatsProps) {
  const { t } = useTranslation();

  return (
    <ResponsiveGrid variant="cards">
      <StatCard
        icon={BookOpen}
        value={stats.enrolledCount}
        label={t('dashboard.enrolledCourses')}
        color="student"
        delay={0.1}
      />
      <StatCard
        icon={CheckCircle2}
        value={stats.completedQuizzes}
        label={t('dashboard.completedQuizzes')}
        color="success"
        delay={0.15}
      />
      <StatCard
        icon={TrendingUp}
        value={stats.averageScore}
        label={t('dashboard.averageScore')}
        color="warning"
        delay={0.2}
        suffix="%"
        showProgress={true}
        progress={stats.averageScore}
      />
    </ResponsiveGrid>
  );
}
