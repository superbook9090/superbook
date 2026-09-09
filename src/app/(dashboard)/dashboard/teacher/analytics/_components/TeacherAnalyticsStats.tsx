'use client';

import React from 'react';
import { BookOpen, Radio, Users, HelpCircle, ClipboardList } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useTranslation } from '@/hooks/useTranslation';
import type { TeacherStats } from './types';

interface TeacherAnalyticsStatsProps {
  overview: TeacherStats['overview'];
}

export default function TeacherAnalyticsStats({ overview }: TeacherAnalyticsStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <StatCard
        icon={BookOpen}
        value={overview?.totalCourses}
        label={t('teacherAnalytics.statCourses')}
        color="teacher"
        delay={0.05}
      />
      <StatCard
        icon={Radio}
        value={overview?.publishedCourses}
        label={t('teacherAnalytics.statLiveCourses')}
        color="success"
        delay={0.1}
      />
      <StatCard
        icon={Users}
        value={overview?.totalStudents}
        label={t('teacherAnalytics.statEnrolledStudents')}
        color="student"
        delay={0.15}
      />
      <StatCard
        icon={HelpCircle}
        value={overview?.totalQuizzes}
        label={t('teacherAnalytics.statQuizzes')}
        color="warning"
        delay={0.2}
      />
      <StatCard
        icon={ClipboardList}
        value={overview?.totalAttempts}
        label={t('teacherAnalytics.statQuizAttempts')}
        color="info"
        delay={0.25}
      />
    </div>
  );
}
