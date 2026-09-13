'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, GraduationCap, HelpCircle,
  TrendingUp, Smartphone, Globe, Award, CheckCircle2,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl antigravity-glass border border-[var(--border)] p-3.5 h-28 animate-pulse flex flex-col justify-between shadow-xs"
          >
            <div className="h-3.5 bg-[var(--surface-muted-strong)] rounded-lg w-1/3 mb-2" />
            <div className="h-7 bg-[var(--surface-muted-strong)] rounded-lg w-1/2 mb-1.5" />
            <div className="h-2.5 bg-[var(--surface-muted-strong)] rounded-lg w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  // Calculated Telemetry
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
    <div className="space-y-2.5">
      {/* 4 Main Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        {/* KPI 1: User Base */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className="antigravity-glass antigravity-card relative overflow-hidden rounded-xl p-3 sm:p-3.5 border border-[var(--border)] hover:border-sky-500/40 transition-all duration-300 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('dashboard.totalPlatformUsers')}
              </span>
              <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-500 border border-sky-500/25 shadow-xs">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[var(--color-foreground)]">
                {usersTotal.toLocaleString()}
              </span>
              {newUsers > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                  <TrendingUp className="w-2.5 h-2.5" />
                  +{newUsers}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
            <span>{studentsCount} {t('admin.studentsCount') || 'Students'}</span>
            <span>•</span>
            <span>{teachersCount} {t('admin.teachersCount') || 'Teachers'}</span>
          </div>
        </motion.div>

        {/* KPI 2: Curriculum Catalog */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.25 }}
          className="antigravity-glass antigravity-card relative overflow-hidden rounded-xl p-3 sm:p-3.5 border border-[var(--border)] hover:border-purple-500/40 transition-all duration-300 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('admin.totalCourses')}
              </span>
              <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-500 border border-purple-500/25 shadow-xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[var(--color-foreground)]">
                {coursesTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-1.5 py-0.2 rounded-full border border-purple-500/20">
                {coursePubPercent}% {t('dashboard.published') || 'Live'}
              </span>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-[var(--border)]/60">
            <div className="w-full bg-[var(--surface-muted-strong)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${coursePubPercent}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* KPI 3: Learning Velocity / Enrollments */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
          className="antigravity-glass antigravity-card relative overflow-hidden rounded-xl p-3 sm:p-3.5 border border-[var(--border)] hover:border-emerald-500/40 transition-all duration-300 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('dashboard.activeEnrollments')}
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[var(--color-foreground)]">
                {enrollmentsTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                {activeEnrollments} {t('common.active') || 'Active'}
              </span>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
            <span>{t('admin.completionRate') || 'Completed'}: {completionRate}%</span>
            <span className="inline-flex items-center gap-1 text-emerald-500">
              <CheckCircle2 className="w-3 h-3" />
              {completedEnrollments}
            </span>
          </div>
        </motion.div>

        {/* KPI 4: Assessments & Performance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.25 }}
          className="antigravity-glass antigravity-card relative overflow-hidden rounded-xl p-3 sm:p-3.5 border border-[var(--border)] hover:border-amber-500/40 transition-all duration-300 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('dashboard.totalAttempts')}
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/25 shadow-xs">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[var(--color-foreground)]">
                {quizAttempts.toLocaleString()}
              </span>
              {avgScore > 0 && (
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20">
                  {avgScore}% {t('admin.passRate') || 'Avg'}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
            <span>{t('dashboard.averageScore')}: {avgScore}%</span>
            {stats.quizzes?.highestScore ? (
              <span className="inline-flex items-center gap-1 text-amber-500">
                <Award className="w-3 h-3" />
                {stats.quizzes.highestScore}%
              </span>
            ) : null}
          </div>
        </motion.div>
      </div>

      {/* Secondary Telemetry Strip: Stickiness & App Traffic */}
      {(stickiness > 0 || appPct > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="antigravity-glass p-2.5 sm:p-3 rounded-xl border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs shadow-xs"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              {t('admin.platformStickiness') || 'DAU/MAU Stickiness'}:
            </span>
            <span className="font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {stickiness}%
            </span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span>Web: <strong className="text-[var(--color-foreground)]">{webPct}%</strong></span>
            </div>
            <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
              <Smartphone className="w-3.5 h-3.5 text-purple-500" />
              <span>App: <strong className="text-[var(--color-foreground)]">{appPct}%</strong></span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
