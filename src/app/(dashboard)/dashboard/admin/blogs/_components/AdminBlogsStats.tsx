'use client';

import React from 'react';
import { Newspaper, CheckCircle, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useTranslation } from '@/hooks/useTranslation';

interface AdminBlogsStatsProps {
  stats: {
    total: number;
    published: number;
    draft: number;
  };
}

export function AdminBlogsStats({ stats }: AdminBlogsStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <StatCard
        icon={Newspaper}
        value={stats.total}
        label={t('admin.totalBlogs')}
        color="teacher"
        delay={0.05}
      />
      <StatCard
        icon={CheckCircle}
        value={stats.published}
        label={t('common.published')}
        color="success"
        delay={0.1}
        description="Publicly readable"
      />
      <StatCard
        icon={Clock}
        value={stats.draft}
        label={t('common.draft')}
        color="warning"
        delay={0.15}
        description="Unpublished works"
      />
    </div>
  );
}
