'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Award, Radio, Trophy, CheckCircle2, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import StatCard from '@/components/ui/StatCard';
import type { AdminStats } from './types';

interface AdminPerformanceTabProps {
  stats: AdminStats;
}

export function AdminPerformanceTab({ stats }: AdminPerformanceTabProps) {
  const { t } = useTranslation();

  const completionRate =
    stats.enrollments.total > 0
      ? Math.round((stats.enrollments.completed / stats.enrollments.total) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 sm:space-y-6 w-full min-w-0"
    >
      {/* Quiz Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 w-full min-w-0">
        <StatCard
          icon={Award}
          value={stats.quizzes.total}
          label={t('adminAnalytics.totalQuizzes')}
          color="info"
          delay={0.05}
        />
        <StatCard
          icon={Radio}
          value={stats.quizzes.published}
          label={t('adminAnalytics.liveCourses')}
          color="success"
          delay={0.1}
        />
        <StatCard
          icon={Award}
          value={stats.quizzes.totalAttempts}
          label={t('adminAnalytics.totalAttempts')}
          color="student"
          delay={0.15}
        />
        <StatCard
          icon={TrendingUp}
          value={stats.quizzes.averageScore}
          suffix="%"
          label={t('adminAnalytics.averageScore')}
          color="student"
          delay={0.2}
          showProgress={true}
          progress={stats.quizzes.averageScore}
        />
        <StatCard
          icon={Trophy}
          value={stats.quizzes.highestScore}
          suffix="%"
          label={t('adminAnalytics.highestScore')}
          color="warning"
          delay={0.25}
          showProgress={true}
          progress={stats.quizzes.highestScore}
        />
        <StatCard
          icon={CheckCircle2}
          value={completionRate}
          suffix="%"
          label={t('adminAnalytics.completionRate')}
          color="success"
          delay={0.3}
          showProgress={true}
          progress={completionRate}
        />
      </div>

      {/* Performance Tiers & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
        <div className="lg:col-span-2 card-panel w-full min-w-0">
          <div className="card-panel-header flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-foreground)] truncate">
                {t('adminAnalytics.performanceOverview')}
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                {t('adminAnalytics.avgScoreDesc')}
              </p>
            </div>
            <Link
              href={ROUTES.admin.quizzes}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto shrink-0"
            >
              <span>{t('adminAnalytics.manageQuizzes')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card-panel-body grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--success-light)] border border-[var(--success)]/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--success)]">
                  {t('adminAnalytics.highPerformers')}
                </span>
                <Sparkles className="w-4 h-4 text-[var(--success)]" />
              </div>
              <p className="text-xl sm:text-2xl font-black tabular-nums text-[var(--success)] font-[family-name:var(--font-display)] mt-3 sm:mt-4">
                &ge; 80%
              </p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-foreground)]/70 mt-1">High Mastery & Retention</p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--warning-light)] border border-[var(--warning)]/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--warning)]">
                  {t('adminAnalytics.averagePerformers')}
                </span>
                <TrendingUp className="w-4 h-4 text-[var(--warning)]" />
              </div>
              <p className="text-xl sm:text-2xl font-black tabular-nums text-[var(--warning)] font-[family-name:var(--font-display)] mt-3 sm:mt-4">
                50% - 79%
              </p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-foreground)]/70 mt-1">Steady Progress & Passing</p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--error-light)] border border-[var(--error)]/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--error)]">
                  {t('adminAnalytics.needsSupport')}
                </span>
                <Award className="w-4 h-4 text-[var(--error)]" />
              </div>
              <p className="text-xl sm:text-2xl font-black tabular-nums text-[var(--error)] font-[family-name:var(--font-display)] mt-3 sm:mt-4">
                &lt; 50%
              </p>
              <p className="text-[10px] sm:text-[11px] text-[var(--color-foreground)]/70 mt-1">Requires Remediation</p>
            </div>
          </div>
        </div>

        {/* System Completion Highlight */}
        <div className="lg:col-span-1 card-panel flex flex-col justify-between w-full min-w-0">
          <div className="card-panel-header">
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
              {t('adminAnalytics.completionRate')}
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1">
              {t('adminAnalytics.completionRateDesc', {
                completed: stats.enrollments.completed,
                total: stats.enrollments.total,
              })}
            </p>
          </div>
          <div className="card-panel-body flex flex-col items-center justify-center py-4 sm:py-6 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-8 border-[var(--success-light)] border-t-[var(--success)] flex items-center justify-center mb-2.5 sm:mb-3">
              <span className="text-xl sm:text-2xl font-bold tabular-nums text-[var(--color-foreground)]">
                {completionRate}%
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-[var(--color-muted-foreground)]">
              {stats.enrollments.completed} of {stats.enrollments.total} enrollments completed
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
