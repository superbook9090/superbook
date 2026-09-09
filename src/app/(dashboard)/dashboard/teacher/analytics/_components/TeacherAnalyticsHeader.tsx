'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface TeacherAnalyticsHeaderProps {
  averageScore: number;
}

export default function TeacherAnalyticsHeader({
  averageScore,
}: TeacherAnalyticsHeaderProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="hero-banner flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl"
    >
      <div className="space-y-1.5 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{t('teacherAnalytics.title')}</span>
        </div>
        <h1 className="heading-xl">{t('teacherAnalytics.title')}</h1>
        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] leading-relaxed">
          {t('teacherAnalytics.description')}
        </p>
      </div>

      <div className="flex items-center gap-4 bg-[var(--card-solid)] antigravity-glass p-5 rounded-3xl border border-[var(--border)] shadow-md sm:min-w-[200px]">
        <div className="text-right flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-muted-foreground)]">
            {t('teacherAnalytics.statAvgScore')}
          </p>
          <p className="gradient-text text-3xl sm:text-4xl font-black leading-none mt-1.5 tabular-nums">
            {averageScore}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}
