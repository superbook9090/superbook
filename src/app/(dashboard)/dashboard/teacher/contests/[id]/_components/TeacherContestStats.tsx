'use client';

import React from 'react';
import { Users, CheckCircle, Trophy, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveGrid } from '@/components/layout';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDuration } from '@/lib/dateUtils';

interface TeacherContestStatsProps {
  stats: {
    totalParticipants: number;
    completedCount: number;
    highestScore: number;
    avgTimeTaken: number;
  };
}

export default function TeacherContestStats({ stats }: TeacherContestStatsProps) {
  const { t } = useTranslation();

  return (
    <ResponsiveGrid variant="cards">
      <StatCard
        icon={Users}
        value={stats.totalParticipants}
        label={t('contest.participants') || 'Participants'}
        color="teacher"
        delay={0.05}
      />
      <StatCard
        icon={CheckCircle}
        value={stats.completedCount}
        label={t('contest.submissions') || 'Submissions'}
        color="success"
        delay={0.1}
      />
      <StatCard
        icon={Trophy}
        value={`${stats.highestScore} pts`}
        label={t('contest.highestScore') || 'Highest Score'}
        color="warning"
        delay={0.15}
      />
      <StatCard
        icon={Clock}
        value={formatDuration(stats.avgTimeTaken)}
        label={t('contest.avgTime') || 'Avg Time'}
        color="info"
        delay={0.2}
      />
    </ResponsiveGrid>
  );
}
