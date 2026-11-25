'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Smartphone, Globe, Layers, Apple, Radio } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PlatformStats } from './types';

interface AdminPlatformDistributionChartProps {
  platformStats?: PlatformStats;
  totalUsers: number;
}

export function AdminPlatformDistributionChart({
  platformStats,
  totalUsers,
}: AdminPlatformDistributionChartProps) {
  const { t } = useTranslation();

  const total = totalUsers || 1;
  const appUsers = platformStats?.totalApp ?? 0;
  const webUsers = platformStats?.totalWeb ?? totalUsers - appUsers;
  const appPct = platformStats?.appPercentage ?? Math.round((appUsers / total) * 100);
  const webPct = platformStats?.webPercentage ?? Math.max(0, 100 - appPct);

  const chartData = useMemo(
    () => [
      {
        name: t('adminAnalytics.platformApp'),
        value: appUsers,
        percentage: appPct,
        color: 'var(--teacher-primary)',
        icon: Smartphone,
      },
      {
        name: t('adminAnalytics.platformWeb'),
        value: webUsers,
        percentage: webPct,
        color: 'var(--info)',
        icon: Globe,
      },
    ],
    [appUsers, webUsers, appPct, webPct, t]
  );

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
  }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const Icon = data.icon;
    return (
      <div className="bg-[var(--card-solid)] p-2.5 rounded-xl shadow-xl border border-[var(--border)] min-w-[140px] text-xs">
        <div className="flex items-center gap-1.5 mb-1 font-bold text-[var(--color-foreground)]">
          <Icon className="w-3.5 h-3.5" style={{ color: data.color }} />
          <span>{data.name}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 tabular-nums">
          <span className="text-sm font-extrabold text-[var(--color-foreground)]">
            {data.value.toLocaleString()}
          </span>
          <span className="text-xs font-bold" style={{ color: data.color }}>
            {data.percentage}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="teacher-panel p-4 sm:p-5 h-full flex flex-col justify-between gap-4 overflow-hidden">
      <div className="flex items-start justify-between gap-2 pb-3.5 border-b border-[var(--border)]/70">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
            <Layers className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.platformDistributionTitle')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
              {t('adminAnalytics.platformDistributionSubtitle')}
            </p>
          </div>
        </div>

        {platformStats?.activeApp !== undefined && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] text-[11px] font-semibold text-[var(--color-muted-foreground)] shrink-0 tabular-nums">
            <Radio className="w-3 h-3 text-emerald-500" />
            <span>{platformStats.activeApp} {t('adminAnalytics.activeInApp30d')}</span>
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="h-[190px] relative w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card-solid)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold tabular-nums text-[var(--color-foreground)] font-[family-name:var(--font-display)] leading-none">
              {appPct}%
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted-foreground)] mt-1">
              {t('adminAnalytics.appShare')}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3.5 border-t border-[var(--border)]/70">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]/70 min-w-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] shrink-0">
              <Smartphone className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs gap-1">
                <span className="font-bold text-[var(--color-foreground)] truncate">
                  {t('adminAnalytics.platformApp')}
                </span>
                <span className="font-extrabold tabular-nums text-[var(--teacher-primary)] shrink-0">
                  {appPct}%
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-muted-foreground)] tabular-nums truncate">
                {appUsers.toLocaleString()} {t('adminAnalytics.totalUsers')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]/70 min-w-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-sky-500/12 text-sky-600 dark:text-sky-400 shrink-0">
              <Globe className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs gap-1">
                <span className="font-bold text-[var(--color-foreground)] truncate">
                  {t('adminAnalytics.platformWeb')}
                </span>
                <span className="font-extrabold tabular-nums text-sky-600 dark:text-sky-400 shrink-0">
                  {webPct}%
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-muted-foreground)] tabular-nums truncate">
                {webUsers.toLocaleString()} {t('adminAnalytics.totalUsers')}
              </p>
            </div>
          </div>
        </div>

        {platformStats && (platformStats.android > 0 || platformStats.ios > 0) && (
          <div className="mt-3 flex items-center justify-between gap-2 px-1 text-[11px] text-[var(--color-muted-foreground)] tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Android: <strong className="text-[var(--color-foreground)]">{platformStats.android.toLocaleString()}</strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <Apple className="w-3 h-3" />
              iOS: <strong className="text-[var(--color-foreground)]">{platformStats.ios.toLocaleString()}</strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe className="w-3 h-3 text-sky-500" />
              Web: <strong className="text-[var(--color-foreground)]">{webUsers.toLocaleString()}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
