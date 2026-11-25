'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Award,
  Radio,
  Trophy,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import StatCard from '@/components/ui/StatCard';
import type { AdminStats } from './types';

const AdminQuizTrendChart = dynamic(
  () => import('./AdminQuizTrendChart').then((m) => m.AdminQuizTrendChart),
  { ssr: false, loading: () => <div className="h-[320px] teacher-panel animate-pulse" /> }
);
const AdminScoreDistributionChart = dynamic(
  () => import('./AdminScoreDistributionChart').then((m) => m.AdminScoreDistributionChart),
  { ssr: false, loading: () => <div className="h-[320px] teacher-panel animate-pulse" /> }
);

interface AdminPerformanceTabProps {
  stats: AdminStats;
}

export function AdminPerformanceTab({ stats }: AdminPerformanceTabProps) {
  const { t } = useTranslation();

  const completionRate =
    stats.enrollments.total > 0
      ? Math.round((stats.enrollments.completed / stats.enrollments.total) * 100)
      : 0;

  const totalTiered =
    (stats.scoreTiers?.high ?? 0) +
    (stats.scoreTiers?.average ?? 0) +
    (stats.scoreTiers?.low ?? 0);

  const pctOf = (count: number) => (totalTiered > 0 ? Math.round((count / totalTiered) * 100) : 0);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset =
    circumference - (Math.min(100, Math.max(0, completionRate)) / 100) * circumference;

  const tiers = [
    {
      label: t('adminAnalytics.highPerformers'),
      range: '≥ 80%',
      count: stats.scoreTiers?.high ?? 0,
      desc: t('adminAnalytics.highMastery'),
      icon: Sparkles,
      cardTone: 'bg-emerald-500/8 border-emerald-500/25',
      textTone: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      label: t('adminAnalytics.averagePerformers'),
      range: '50% – 79%',
      count: stats.scoreTiers?.average ?? 0,
      desc: t('adminAnalytics.steadyProgress'),
      icon: TrendingUp,
      cardTone: 'bg-amber-500/8 border-amber-500/25',
      textTone: 'text-amber-700 dark:text-amber-400',
    },
    {
      label: t('adminAnalytics.needsSupport'),
      range: '< 50%',
      count: stats.scoreTiers?.low ?? 0,
      desc: t('adminAnalytics.requiresRemediation'),
      icon: Award,
      cardTone: 'bg-rose-500/8 border-rose-500/25',
      textTone: 'text-rose-700 dark:text-rose-400',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 w-full min-w-0">
      {/* Quiz KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
        <StatCard icon={Award} value={stats.quizzes.total} label={t('adminAnalytics.totalQuizzes')} color="teacher" delay={0.04} />
        <StatCard icon={Radio} value={stats.quizzes.published} label={t('adminAnalytics.liveCourses')} color="success" delay={0.08} />
        <StatCard icon={Award} value={stats.quizzes.totalAttempts} label={t('adminAnalytics.totalAttempts')} color="info" delay={0.12} />
        <StatCard icon={TrendingUp} value={stats.quizzes.averageScore} suffix="%" label={t('adminAnalytics.averageScore')} color="student" delay={0.16} showProgress progress={stats.quizzes.averageScore} />
        <StatCard icon={Trophy} value={stats.quizzes.highestScore} suffix="%" label={t('adminAnalytics.highestScore')} color="warning" delay={0.2} showProgress progress={stats.quizzes.highestScore} />
        <StatCard icon={CheckCircle2} value={completionRate} suffix="%" label={t('adminAnalytics.completionRate')} color="success" delay={0.24} showProgress progress={completionRate} />
      </div>

      {/* Dual-Axis Trend & Score Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
        <AdminQuizTrendChart data={stats.dailyQuizScores} />
        <AdminScoreDistributionChart
          data={stats.scoreDistribution}
          scoreTiers={stats.scoreTiers}
        />
      </div>

      {/* Performance Tiers & Completion Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
        <div className="lg:col-span-2 teacher-panel p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--border)]/70">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
                {t('adminAnalytics.performanceOverview')}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                {t('adminAnalytics.avgScoreDesc')}
              </p>
            </div>
            <Link
              href={ROUTES.admin.quizzes}
              className="teacher-cta-btn min-h-[40px] px-3.5 text-xs shrink-0 self-start sm:self-auto"
            >
              <span>{t('adminAnalytics.manageQuizzes')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.label}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${tier.cardTone}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${tier.textTone}`}>
                      {tier.range}
                    </span>
                    <Icon className={`w-4 h-4 shrink-0 ${tier.textTone}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-extrabold tabular-nums font-[family-name:var(--font-display)] ${tier.textTone}`}>
                      {tier.count.toLocaleString()}
                      {totalTiered > 0 && (
                        <span className="text-xs font-bold ml-1.5 opacity-80">
                          ({pctOf(tier.count)}%)
                        </span>
                      )}
                    </p>
                    <p className="text-xs font-semibold text-[var(--color-foreground)] mt-1">
                      {tier.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Proportional SVG Completion Ring */}
        <div className="lg:col-span-1 teacher-panel p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="pb-3.5 border-b border-[var(--border)]/70">
            <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)]">
              {t('adminAnalytics.completionRate')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {t('adminAnalytics.completionRateDesc', {
                completed: stats.enrollments.completed,
                total: stats.enrollments.total,
              })}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-3 text-center gap-3">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 104 104" aria-hidden>
                <circle
                  cx="52"
                  cy="52"
                  r={radius}
                  fill="none"
                  stroke="var(--surface-muted-strong)"
                  strokeWidth="10"
                />
                <circle
                  cx="52"
                  cy="52"
                  r={radius}
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute text-2xl font-extrabold font-[family-name:var(--font-display)] tabular-nums text-[var(--color-foreground)]">
                {completionRate}%
              </span>
            </div>

            <p className="text-xs font-semibold text-[var(--color-muted-foreground)] tabular-nums">
              <strong className="text-[var(--color-foreground)]">
                {stats.enrollments.completed.toLocaleString()}
              </strong>{' '}
              / {stats.enrollments.total.toLocaleString()} {t('adminAnalytics.completedEnrollments').toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
