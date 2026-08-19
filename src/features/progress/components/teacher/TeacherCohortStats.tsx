'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ProgressOverviewStats, type StatItem } from '../ProgressOverviewStats';
import type { TeacherOverallStats } from '../../types';

interface TeacherCohortStatsProps {
  stats: TeacherOverallStats | null;
}

export function TeacherCohortStats({ stats }: TeacherCohortStatsProps) {
  const { t } = useTranslation();

  if (!stats) return null;

  const statItems: StatItem[] = [
    {
      label: t('progress.totalStudents'),
      value: stats.totalStudents,
      colorClass: 'text-[var(--teacher-primary)]',
      sublabel: `${stats.totalEnrollments} ${t('progress.coursesEnrolled')}`,
    },
    {
      label: t('progress.classAvgProgress'),
      value: `${stats.averageProgress}%`,
      colorClass: 'text-[var(--student-primary)]',
    },
    {
      label: t('progress.classAvgScore'),
      value: `${stats.averageScore}%`,
      colorClass: 'text-[var(--success)]',
    },
    {
      label: t('progress.completed'),
      value: stats.completedEnrollments,
      colorClass: 'text-[var(--success)]',
    },
    {
      label: t('progress.atRiskStudents'),
      value: stats.strugglingCount,
      colorClass: 'text-red-500',
    },
    {
      label: t('courses.totalCourses'),
      value: stats.totalCourses,
      colorClass: 'text-[var(--teacher-accent)]',
    },
  ];

  return <ProgressOverviewStats stats={statItems} />;
}
