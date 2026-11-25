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
    <div className="teacher-panel p-4 sm:p-5 h-full flex flex-col justify-between gap-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-[var(--border)]/70">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Activity className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.activityEngagementTitle')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
              {t('adminAnalytics.activityEngagementSubtitle')}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold shrink-0 self-start sm:self-auto tabular-nums">
          <Zap className="w-3.5 h-3.5" />
          <span>{stickiness}% {t('adminAnalytics.stickiness')}</span>
        </span>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* DAU */}
          <div className="p-3 rounded-xl bg-[var(--surface-muted)]/65 border border-[var(--border)]/70 flex flex-col justify-between gap-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
              <span className="truncate">{t('adminAnalytics.activeToday')}</span>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <div className="text-xl font-extrabold font-[family-name:var(--font-display)] tabular-nums text-[var(--color-foreground)]">
              {dau.toLocaleString()}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {Math.round((dau / total) * 100)}% {t('adminAnalytics.ofTotal')}
            </span>
          </div>

          {/* WAU */}
          <div className="p-3 rounded-xl bg-[var(--surface-muted)]/65 border border-[var(--border)]/70 flex flex-col justify-between gap-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
              <span className="truncate">{t('adminAnalytics.activeThisWeek')}</span>
              <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            </div>
            <div className="text-xl font-extrabold font-[family-name:var(--font-display)] tabular-nums text-[var(--color-foreground)]">
              {wau.toLocaleString()}
            </div>
            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
              {Math.round((wau / total) * 100)}% {t('adminAnalytics.ofTotal')}
            </span>
          </div>

          {/* MAU */}
          <div className="p-3 rounded-xl bg-[var(--surface-muted)]/65 border border-[var(--border)]/70 flex flex-col justify-between gap-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
              <span className="truncate">{t('adminAnalytics.activeThisMonth')}</span>
              <UserCheck className="w-3.5 h-3.5 text-[var(--teacher-primary)] shrink-0" />
            </div>
            <div className="text-xl font-extrabold font-[family-name:var(--font-display)] tabular-nums text-[var(--color-foreground)]">
              {mau.toLocaleString()}
            </div>
            <span className="text-[11px] font-semibold text-[var(--teacher-primary)] tabular-nums">
              {Math.round((mau / total) * 100)}% {t('adminAnalytics.ofTotal')}
            </span>
          </div>

          {/* Inactive */}
          <div className="p-3 rounded-xl bg-[var(--surface-muted)]/65 border border-[var(--border)]/70 flex flex-col justify-between gap-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-muted-foreground)]">
              <span className="truncate">{t('adminAnalytics.inactiveUsers')}</span>
              <UserMinus className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
            </div>
            <div className="text-xl font-extrabold font-[family-name:var(--font-display)] tabular-nums text-[var(--color-muted-foreground)]">
              {inactive.toLocaleString()}
            </div>
            <span className="text-[11px] font-medium text-[var(--color-muted-foreground)] tabular-nums">
              {Math.round((inactive / total) * 100)}% {t('adminAnalytics.ofTotal')}
            </span>
          </div>
        </div>

        {/* Recency Distribution Bar */}
        <div className="pt-3 border-t border-[var(--border)]/70 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[var(--color-foreground)] inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
              <span>{t('adminAnalytics.recencyDistribution')}</span>
            </span>
            <span className="text-[11px] font-semibold text-[var(--color-muted-foreground)] tabular-nums">
              {totalUsers.toLocaleString()} {t('adminAnalytics.totalTracked')}
            </span>
          </div>

          <div className="w-full bg-[var(--surface-muted-strong)] rounded-full h-3 flex overflow-hidden">
            {pct24h > 0 && (
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${pct24h}%` }}
                title={`Last 24h: ${r24h} (${pct24h}%)`}
              />
            )}
            {pct7d > 0 && (
              <div
                className="bg-sky-500 h-full transition-all"
                style={{ width: `${pct7d}%` }}
                title={`1-7 Days: ${r7d} (${pct7d}%)`}
              />
            )}
            {pct30d > 0 && (
              <div
                className="bg-amber-500 h-full transition-all"
                style={{ width: `${pct30d}%` }}
                title={`8-30 Days: ${r30d} (${pct30d}%)`}
              />
            )}
            {pctOlder > 0 && (
              <div
                className="bg-[var(--color-muted-foreground)]/30 h-full transition-all"
                style={{ width: `${pctOlder}%` }}
                title={`>30 Days / Never: ${rOlder} (${pctOlder}%)`}
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[var(--color-muted-foreground)] tabular-nums">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>&lt;24h: <strong className="text-[var(--color-foreground)]">{r24h.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
              <span>1-7d: <strong className="text-[var(--color-foreground)]">{r7d.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>8-30d: <strong className="text-[var(--color-foreground)]">{r30d.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-muted-foreground)]/40 shrink-0" />
              <span>&gt;30d: <strong className="text-[var(--color-foreground)]">{rOlder.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
