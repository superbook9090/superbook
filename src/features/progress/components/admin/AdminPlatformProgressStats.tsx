'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ProgressOverviewStats, type StatItem } from '../ProgressOverviewStats';
import type { AdminOverallStats } from '../../types';

interface AdminPlatformProgressStatsProps {
  stats: AdminOverallStats | null;
}

export function AdminPlatformProgressStats({ stats }: AdminPlatformProgressStatsProps) {
  const { t } = useTranslation();

  if (!stats) return null;

  const statItems: StatItem[] = [
    {
      label: t('progress.totalStudents'),
      value: stats.totalStudents,
      colorClass: 'text-[var(--admin-primary)]',
    },
    {
      label: t('progress.platformCompletion'),
      value: `${stats.completionRate}%`,
      colorClass: 'text-[var(--success)]',
      sublabel: `${stats.completedEnrollments}/${stats.totalEnrollments} ${t('progress.completed')}`,
    },
    {
      label: t('progress.avgProgress'),
      value: `${stats.averageProgress}%`,
      colorClass: 'text-[var(--student-primary)]',
    },
    {
      label: t('progress.avgQuizScore'),
      value: `${stats.platformAverageScore}%`,
      colorClass: 'text-[var(--info)]',
    },
    {
      label: t('progress.quizzesPassed'),
      value: stats.quizzesPassed,
      colorClass: 'text-[var(--success)]',
      sublabel: `${stats.totalQuizzesTaken} ${t('progress.totalQuizzes')}`,
    },
    {
      label: t('courses.totalCourses'),
      value: stats.totalCourses,
      colorClass: 'text-[var(--teacher-accent)]',
    },
  ];

  return <ProgressOverviewStats stats={statItems} />;
}
