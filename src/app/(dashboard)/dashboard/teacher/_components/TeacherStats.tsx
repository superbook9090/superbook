'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { BookOpen, Users, HelpCircle, BarChart3 } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveGrid } from '@/components/layout';
import { useFeature } from '@/contexts/AppSettingsContext';
import type { TeacherStatsData } from './types';

interface TeacherStatsProps {
  stats: TeacherStatsData;
  courseLimit: number;
  quizLimit: number;
  blogLimit: number;
}

export default function TeacherStats({
  stats,
  courseLimit,
  quizLimit,
  blogLimit,
}: TeacherStatsProps) {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableBlogs = useFeature('enableBlogs');

  const courseUsage = Math.min(100, Math.round((stats.totalCourses / courseLimit) * 100));
  const quizUsage = Math.min(100, Math.round((stats.totalQuizzes / quizLimit) * 100));
  const blogUsage = Math.min(100, Math.round((stats.totalBlogs / blogLimit) * 100));

  return (
    <ResponsiveGrid variant="stats">
      {enableCourses && (
        <StatCard
          icon={BookOpen}
          value={`${stats.totalCourses} / ${courseLimit}`}
          label={t('dashboard.myCourses')}
          color="teacher"
          delay={0.1}
          showProgress={true}
          progress={courseUsage}
          description={courseUsage >= 80 ? `⚠️ ${courseUsage}% ${t('dashboard.used')}` : undefined}
        />
      )}

      <StatCard
        icon={Users}
        value={stats.totalStudents}
        label={t('dashboard.students')}
        color="info"
        delay={0.15}
      />

      {enableQuizzes && (
        <StatCard
          icon={HelpCircle}
          value={`${stats.totalQuizzes} / ${quizLimit}`}
          label={t('dashboard.myQuizzes')}
          color="student"
          delay={0.2}
          showProgress={true}
          progress={quizUsage}
          description={quizUsage >= 80 ? `⚠️ ${quizUsage}% ${t('dashboard.used')}` : undefined}
        />
      )}

      {enableBlogs && (
        <StatCard
          icon={BarChart3}
          value={`${stats.totalBlogs} / ${blogLimit}`}
          label={t('dashboard.myBlogs')}
          color="admin"
          delay={0.25}
          showProgress={true}
          progress={blogUsage}
          description={blogUsage >= 80 ? `⚠️ ${blogUsage}% ${t('dashboard.used')}` : undefined}
        />
      )}
    </ResponsiveGrid>
  );
}
