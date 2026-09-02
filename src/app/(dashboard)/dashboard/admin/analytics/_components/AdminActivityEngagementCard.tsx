'use client';

import { Activity, Clock, Zap, UserCheck, UserMinus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { ActiveUsersStats } from './types';

interface AdminActivityEngagementCardProps {
  activeUsers?: ActiveUsersStats;
  totalUsers: number;
}

export function AdminActivityEngagementCard({
  activeUsers,
  totalUsers,
}: AdminActivityEngagementCardProps) {
  const { t } = useTranslation();

  const total = totalUsers || 1;
  const dau = activeUsers?.dau ?? 0;
  const wau = activeUsers?.wau ?? 0;
  const mau = activeUsers?.mau ?? 0;
  const inactive = activeUsers?.inactive ?? Math.max(0, totalUsers - mau);
  const stickiness = activeUsers?.stickinessRatio ?? (mau > 0 ? Math.round((dau / mau) * 100) : 0);

  const r24h = activeUsers?.recency?.within24Hours ?? dau;
  const r7d = activeUsers?.recency?.within7Days ?? Math.max(0, wau - dau);
  const r30d = activeUsers?.recency?.within30Days ?? Math.max(0, mau - wau);
  const rOlder = activeUsers?.recency?.olderOrNever ?? inactive;

  const pct24h = Math.round((r24h / total) * 100);
  const pct7d = Math.round((r7d / total) * 100);
  const pct30d = Math.round((r30d / total) * 100);
  const pctOlder = Math.max(0, 100 - pct24h - pct7d - pct30d);

  return (
    <div className="card-panel flex flex-col justify-between w-full min-w-0 overflow-hidden">
      <div className="card-panel-header flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[var(--student-soft)] text-[var(--student-primary)] shrink-0">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.activityEngagementTitle') || 'User Activity & Last Opened Recency'}
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
            {t('adminAnalytics.activityEngagementSubtitle') || 'Daily active learners, engagement retention, and stickiness ratio'}
          </p>
        </div>

        {/* Stickiness Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--success-light)] text-[var(--success)] text-xs font-bold shrink-0 self-start sm:self-auto">
          <Zap className="w-3.5 h-3.5" />
          <span>{stickiness}% {t('adminAnalytics.stickiness') || 'DAU/MAU Stickiness'}</span>
        </div>
      </div>

      <div className="card-panel-body space-y-4 sm:space-y-5">
        {/* KPI Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Active Today */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
              <span className="truncate">{t('adminAnalytics.activeToday') || 'Active Today (DAU)'}</span>
              <span className="w-2 h-2 rounded-full bg-[var(--success)] shrink-0 animate-ping" />
            </div>
            <div className="text-lg sm:text-xl font-bold tabular-nums text-[var(--color-foreground)] mt-1">
              {dau}
            </div>
            <span className="text-[10px] font-medium text-[var(--success)] mt-0.5">
              {Math.round((dau / total) * 100)}% {t('adminAnalytics.ofTotal') || 'of total'}
            </span>
          </div>

          {/* Active This Week */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
              <span className="truncate">{t('adminAnalytics.activeThisWeek') || 'Active 7 Days (WAU)'}</span>
              <Clock className="w-3.5 h-3.5 text-[var(--info)] shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold tabular-nums text-[var(--color-foreground)] mt-1">
              {wau}
            </div>
            <span className="text-[10px] font-medium text-[var(--info)] mt-0.5">
              {Math.round((wau / total) * 100)}% {t('adminAnalytics.ofTotal') || 'of total'}
            </span>
          </div>

          {/* Active This Month */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
              <span className="truncate">{t('adminAnalytics.activeThisMonth') || 'Active 30 Days (MAU)'}</span>
              <UserCheck className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold tabular-nums text-[var(--color-foreground)] mt-1">
              {mau}
            </div>
            <span className="text-[10px] font-medium text-[var(--primary)] mt-0.5">
              {Math.round((mau / total) * 100)}% {t('adminAnalytics.ofTotal') || 'of total'}
            </span>
          </div>

          {/* Inactive */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
              <span className="truncate">{t('adminAnalytics.inactiveUsers') || 'Inactive (>30 Days)'}</span>
              <UserMinus className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-bold tabular-nums text-[var(--color-muted-foreground)] mt-1">
              {inactive}
            </div>
            <span className="text-[10px] font-medium text-[var(--color-muted)] mt-0.5">
              {Math.round((inactive / total) * 100)}% {t('adminAnalytics.ofTotal') || 'of total'}
            </span>
          </div>
        </div>

        {/* Recency Distribution Bar */}
        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--color-foreground)] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--color-muted)]" />
              <span>{t('adminAnalytics.recencyDistribution') || 'Last Opened Recency Breakdown'}</span>
            </span>
            <span className="text-[11px] text-[var(--color-muted-foreground)]">
              {total} {t('adminAnalytics.totalTracked') || 'total users'}
            </span>
          </div>

          {/* Stacked Bar */}
          <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-3 flex overflow-hidden">
            {pct24h > 0 && (
              <div
                className="bg-[var(--success)] h-full transition-all"
                style={{ width: `${pct24h}%` }}
                title={`Last 24h: ${r24h} (${pct24h}%)`}
              />
            )}
            {pct7d > 0 && (
              <div
                className="bg-[var(--info)] h-full transition-all"
                style={{ width: `${pct7d}%` }}
                title={`1-7 Days: ${r7d} (${pct7d}%)`}
              />
            )}
            {pct30d > 0 && (
              <div
                className="bg-[var(--warning)] h-full transition-all"
                style={{ width: `${pct30d}%` }}
                title={`8-30 Days: ${r30d} (${pct30d}%)`}
              />
            )}
            {pctOlder > 0 && (
              <div
                className="bg-[var(--color-muted)]/40 h-full transition-all"
                style={{ width: `${pctOlder}%` }}
                title={`>30 Days / Never: ${rOlder} (${pctOlder}%)`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[var(--color-muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] shrink-0" />
              <span>&lt;24h: <strong className="text-[var(--color-foreground)] font-mono">{r24h}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--info)] shrink-0" />
              <span>1-7d: <strong className="text-[var(--color-foreground)] font-mono">{r7d}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--warning)] shrink-0" />
              <span>8-30d: <strong className="text-[var(--color-foreground)] font-mono">{r30d}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-muted)]/40 shrink-0" />
              <span>&gt;30d/Never: <strong className="text-[var(--color-foreground)] font-mono">{rOlder}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
