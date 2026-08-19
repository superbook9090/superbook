'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import {
  LazyAverageScoreChart,
  LazyCourseProgressChart,
  LazyQuizStatusChart,
  LazyScoreTrendChart,
} from '@/lib/lazy';

interface StudentInsightsChartsProps {
  scoreTrendData: Array<{ date: string; score: number; quizTitle: string }>;
  courseProgressData: Array<{ courseTitle: string; progress: number; status: 'completed' | 'active' | 'inactive' }>;
  quizStatusData: Array<{ name: string; value: number; color: string }>;
  averageScoreData: Array<{ date: string; averageScore: number; movingAverage: number; attemptCount: number }>;
}

export function StudentInsightsCharts({
  scoreTrendData,
  courseProgressData,
  quizStatusData,
  averageScoreData,
}: StudentInsightsChartsProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
          {t('progress.insights')}
        </h2>
      </div>

      <ResponsiveGrid variant="charts">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <LazyScoreTrendChart data={scoreTrendData} title={t('progress.scoreTrend')} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <LazyCourseProgressChart data={courseProgressData} title={t('progress.courseProgress')} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <LazyQuizStatusChart data={quizStatusData} title={t('progress.quizDistribution')} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <LazyAverageScoreChart data={averageScoreData} title={t('progress.averageScore')} />
        </motion.div>
      </ResponsiveGrid>
    </section>
  );
}
