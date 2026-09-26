'use client';

import React from 'react';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveGrid } from '@/components/layout';
import { useTranslation } from '@/hooks/useTranslation';

interface TeacherBlogsStatsProps {
  stats: {
    total: number;
    published: number;
    draft: number;
  };
}

export default function TeacherBlogsStats({ stats }: TeacherBlogsStatsProps) {
  const { t } = useTranslation();

  return (
    <ResponsiveGrid variant="cards">
      <StatCard
        icon={BookOpen}
        value={stats.total}
        label={t('blog.totalBlogs')}
        color="teacher"
        delay={0.05}
      />
      <StatCard
        icon={CheckCircle}
        value={stats.published}
        label={t('blog.published')}
        color="success"
        delay={0.1}
      />
      <StatCard
        icon={Clock}
        value={stats.draft}
        label={t('blog.draft')}
        color="warning"
        delay={0.15}
      />
    </ResponsiveGrid>
  );
}
