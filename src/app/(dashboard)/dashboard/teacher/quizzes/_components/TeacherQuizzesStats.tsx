'use client';

import React from 'react';
import { HelpCircle, CheckCircle, Clock, FileQuestion } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveGrid } from '@/components/layout';
import { useTranslation } from '@/hooks/useTranslation';
import type { Quiz } from '@/lib/react-query/hooks';

interface TeacherQuizzesStatsProps {
  quizzes: Quiz[];
  totalQuizzes?: number;
}

export default function TeacherQuizzesStats({
  quizzes,
  totalQuizzes,
}: TeacherQuizzesStatsProps) {
  const { t } = useTranslation();

  const total = totalQuizzes ?? quizzes.length;
  const publishedCount = quizzes.filter((q) => q.isPublished).length;
  const draftCount = quizzes.filter((q) => !q.isPublished).length;
  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questionCount ?? 0), 0);

  return (
    <ResponsiveGrid variant="cards">
      <StatCard
        icon={HelpCircle}
        value={total}
        label={t('teacherQuizzes.totalQuizzes') || 'Total Quizzes'}
        color="teacher"
        delay={0.05}
      />
      <StatCard
        icon={CheckCircle}
        value={publishedCount}
        label={t('teacherQuizzes.published') || 'Published'}
        color="success"
        delay={0.1}
      />
      <StatCard
        icon={Clock}
        value={draftCount}
        label={t('teacherQuizzes.draft') || 'Drafts'}
        color="warning"
        delay={0.15}
      />
      <StatCard
        icon={FileQuestion}
        value={totalQuestions}
        label={t('teacherQuizzes.questions') || 'Questions'}
        color="student"
        delay={0.2}
      />
    </ResponsiveGrid>
  );
}
