'use client';

import { useTranslation } from '@/hooks/useTranslation';
import {
  Users,
  BookOpen,
  GraduationCap,
  HelpCircle,
  TrendingUp,
  Smartphone,
  Globe,
  Award,
  CheckCircle2,
} from 'lucide-react';
import type { AdminStats } from './types';

interface AdminStatsGridProps {
  stats: AdminStats | null;
  isLoading: boolean;
}

export default function AdminStatsGrid({ stats, isLoading }: AdminStatsGridProps) {
  const { t } = useTranslation();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="teacher-card p-4 h-32 animate-pulse flex flex-col justify-between"
          >
            <div className="h-3.5 bg-[var(--surface-muted-strong)] rounded-md w-1/3" />
            <div className="h-7 bg-[var(--surface-muted-strong)] rounded-md w-1/2" />
            <div className="h-3 bg-[var(--surface-muted-strong)] rounded-md w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const usersTotal = stats.users?.total || 0;
  const newUsers = stats.users?.newThisMonth || 0;
  const studentsCount = stats.users?.students || 0;
  const teachersCount = stats.users?.teachers || 0;

  const coursesTotal = stats.courses?.total || 0;
  const coursesPublished = stats.courses?.published || 0;
  const coursePubPercent = coursesTotal > 0 ? Math.round((coursesPublished / coursesTotal) * 100) : 0;

  const enrollmentsTotal = stats.enrollments?.total || 0;
  const activeEnrollments = stats.enrollments?.active || 0;
  const completedEnrollments = stats.enrollments?.completed || 0;
  const completionRate = enrollmentsTotal > 0 ? Math.round((completedEnrollments / enrollmentsTotal) * 100) : 0;

  const quizAttempts = stats.quizzes?.totalAttempts || 0;
  const avgScore = stats.quizzes?.averageScore || 0;

  const stickiness = stats.activeUsers?.stickinessRatio || 0;
  const appPct = stats.platformStats?.appPercentage || 0;
  const webPct = stats.platformStats?.webPercentage || 100;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* KPI 1: User Base */}
        <div className="teacher-card p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('dashboard.totalPlatformUsers')}
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-sky-500/12 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] tabular-nums">
                {usersTotal.toLocaleString()}
              </span>
              {newUsers > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/12 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="w-2.5 h-2.5" />
                  +{newUsers}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-[var(--border)]/70 flex items-center justify-between text-xs font-medium text-[var(--color-muted-foreground)] tabular-nums">
            <span>{studentsCount.toLocaleString()} {t('admin.studentsCount')}</span>
            <span className="opacity-40">•</span>
            <span>{teachersCount.toLocaleString()} {t('admin.teachersCount')}</span>
          </div>
        </div>

        {/* KPI 2: Curriculum Catalog */}
        <div className="teacher-card p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('admin.totalCourses')}
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
                <BookOpen className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] tabular-nums">
                {coursesTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-[var(--teacher-primary)] bg-[var(--teacher-soft)] px-2 py-0.5 rounded-full border border-[var(--teacher-border)]">
                {coursePubPercent}% {t('dashboard.published')}
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-[var(--border)]/70 space-y-1.5">
            <div className="w-full bg-[var(--surface-muted-strong)] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${coursePubPercent}%`, background: 'var(--teacher-gradient)' }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Enrollments */}
        <div className="teacher-card p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('dashboard.activeEnrollments')}
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <GraduationCap className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] tabular-nums">
                {enrollmentsTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/12 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {activeEnrollments.toLocaleString()} {t('common.active')}
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-[var(--border)]/70 flex items-center justify-between text-xs font-medium text-[var(--color-muted-foreground)] tabular-nums">
            <span>{t('admin.completionRate')}: {completionRate}%</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completedEnrollments.toLocaleString()}
            </span>
          </div>
        </div>

        {/* KPI 4: Assessments */}
        <div className="teacher-card p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('dashboard.totalAttempts')}
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-amber-500/12 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <HelpCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] tabular-nums">
                {quizAttempts.toLocaleString()}
              </span>
              {avgScore > 0 && (
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/12 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {avgScore}% {t('admin.passRate')}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-[var(--border)]/70 flex items-center justify-between text-xs font-medium text-[var(--color-muted-foreground)] tabular-nums">
            <span>{t('dashboard.averageScore')}: {avgScore}%</span>
            {stats.quizzes?.highestScore ? (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <Award className="w-3.5 h-3.5" />
                {stats.quizzes.highestScore}%
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Telemetry Strip */}
      {(stickiness > 0 || appPct > 0) && (
        <div className="teacher-panel px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-[var(--color-foreground)] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              {t('admin.platformStickiness')}:
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/12 px-2 py-0.5 rounded-md tabular-nums">
              {stickiness}%
            </span>
          </div>

          <div className="flex items-center gap-4 tabular-nums">
            <div className="flex items-center gap-1.5 text-[var(--color-muted-foreground)]">
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span>Web: <strong className="text-[var(--color-foreground)]">{webPct}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--color-muted-foreground)]">
              <Smartphone className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
              <span>App: <strong className="text-[var(--color-foreground)]">{appPct}%</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
