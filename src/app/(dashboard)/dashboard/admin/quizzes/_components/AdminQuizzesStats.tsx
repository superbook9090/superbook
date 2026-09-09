'use client';

import React from 'react';
import { HelpCircle, CheckCircle, Clock, BookOpen } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveGrid } from '@/components/layout';
import { useTranslation } from '@/hooks/useTranslation';
import type { Quiz } from '@/types';

interface AdminQuizzesStatsProps {
  quizzes: Quiz[];
  totalQuizzes?: number;
  totalCourses?: number;
}

export function AdminQuizzesStats({ quizzes, totalQuizzes, totalCourses }: AdminQuizzesStatsProps) {
  const { t } = useTranslation();

  const total = totalQuizzes ?? quizzes.length;
  const publishedCount = quizzes.filter((q) => q.isPublished).length;
  const draftCount = quizzes.filter((q) => !q.isPublished).length;

  return (
    <ResponsiveGrid variant="cards">
      <StatCard
        icon={HelpCircle}
        value={total}
        label={t('admin.totalQuizzes')}
        color="student"
        delay={0.05}
      />
      <StatCard
        icon={CheckCircle}
        value={publishedCount}
        label={t('common.published')}
        color="success"
        delay={0.1}
        description="Active in curriculum"
      />
      <StatCard
        icon={Clock}
        value={draftCount}
        label={t('common.draft')}
        color="warning"
        delay={0.15}
        description="Unpublished drafts"
      />
      <StatCard
        icon={BookOpen}
        value={totalCourses ?? '—'}
        label={t('teacherQuizzes.tableCourse')}
        color="info"
        delay={0.2}
      />
    </ResponsiveGrid>
  );
}
