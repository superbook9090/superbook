'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import type { StudentStatsData } from './types';

interface StudentStatsProps {
  stats: StudentStatsData;
}

export default function StudentStats({ stats }: StudentStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <StatCard
        icon={BookOpen}
        value={stats.enrolledCount}
        label={t('dashboard.enrolledCourses')}
        color="student"
        delay={0.05}
      />
      <StatCard
        icon={CheckCircle2}
        value={stats.completedQuizzes}
        label={t('dashboard.completedQuizzes')}
        color="success"
        delay={0.1}
      />
      <StatCard
        icon={TrendingUp}
        value={stats.averageScore}
        label={t('dashboard.averageScore')}
        color="warning"
        delay={0.15}
        suffix="%"
        showProgress
        progress={stats.averageScore}
      />
    </div>
  );
}
