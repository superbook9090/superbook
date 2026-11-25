'use client';

import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';

interface TeacherAnalyticsHeaderProps {
  averageScore: number;
}

export default function TeacherAnalyticsHeader({
  averageScore,
}: TeacherAnalyticsHeaderProps) {
  const { t } = useTranslation();

  return (
    <TeacherPageBanner
      icon={BarChart3}
      eyebrow={t('common.analytics')}
      title={t('teacherAnalytics.title')}
      description={t('teacherAnalytics.description')}
      actions={
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]/80 w-full sm:w-auto justify-between sm:justify-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              {t('teacherAnalytics.statAvgScore')}
            </p>
            <p className="gradient-text text-2xl font-extrabold leading-none mt-1 tabular-nums">
              {averageScore}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl gradient-bg text-white flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      }
    />
  );
}
