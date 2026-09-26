'use client';

import React from 'react';
import { Trophy, Flame, Clock, CheckCircle } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveGrid } from '@/components/layout';
import { useTranslation } from '@/hooks/useTranslation';

interface TeacherContestsStatsProps {
  stats: {
    liveCount: number;
    upcomingCount: number;
    completedCount: number;
  };
  totalCount: number;
}

export default function TeacherContestsStats({
  stats,
  totalCount,
}: TeacherContestsStatsProps) {
  const { t } = useTranslation();

  return (
    <ResponsiveGrid variant="cards">
      <StatCard
        icon={Trophy}
        value={totalCount}
        label={t('contest.totalContests')}
        color="teacher"
        delay={0.05}
      />
      <StatCard
        icon={Flame}
        value={stats.liveCount}
        label={t('contest.live')}
        color="warning"
        delay={0.1}
      />
      <StatCard
        icon={Clock}
        value={stats.upcomingCount}
        label={t('contest.upcoming')}
        color="info"
        delay={0.15}
      />
      <StatCard
        icon={CheckCircle}
        value={stats.completedCount}
        label={t('contest.completed')}
        color="success"
        delay={0.2}
      />
    </ResponsiveGrid>
  );
}
