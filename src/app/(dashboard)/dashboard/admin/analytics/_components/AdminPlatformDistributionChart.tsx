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
  const webUsers = platformStats?.totalWeb ?? (totalUsers - appUsers);
  const appPct = platformStats?.appPercentage ?? Math.round((appUsers / total) * 100);
  const webPct = platformStats?.webPercentage ?? Math.max(0, 100 - appPct);

  const chartData = useMemo(() => {
    return [
      {
        name: t('adminAnalytics.platformApp') || 'Mobile App',
        value: appUsers,
        percentage: appPct,
        color: 'var(--primary)',
        icon: Smartphone,
      },
      {
        name: t('adminAnalytics.platformWeb') || 'Website (Browser)',
        value: webUsers,
        percentage: webPct,
        color: 'var(--info)',
        icon: Globe,
      },
    ];
  }, [appUsers, webUsers, appPct, webPct, t]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const Icon = data.icon;
      return (
        <div className="bg-[var(--card-solid)] p-2.5 sm:p-3 rounded-xl shadow-xl border border-[var(--color-border)] min-w-[140px] text-xs">
          <div className="flex items-center gap-1.5 mb-1 font-semibold text-[var(--color-foreground)]">
            <Icon className="w-3.5 h-3.5" style={{ color: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm sm:text-base font-bold tabular-nums text-[var(--color-foreground)]">
              {data.value}
            </span>
            <span className="text-xs font-semibold" style={{ color: data.color }}>
              {data.percentage}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-panel flex flex-col h-full justify-between w-full min-w-0 overflow-hidden">
      <div className="card-panel-header flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.platformDistributionTitle') || 'Platform Usage (App vs Website)'}
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
            {t('adminAnalytics.platformDistributionSubtitle') || 'Adoption breakdown across Mobile App and Web Browser'}
          </p>
        </div>

        {platformStats?.activeApp !== undefined && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] text-[11px] font-medium shrink-0 self-start sm:self-auto">
            <Radio className="w-3 h-3 text-[var(--success)] animate-pulse" />
            <span>{platformStats.activeApp} active in App (30d)</span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-center w-full min-w-0">
        <div className="h-[180px] sm:h-[200px] relative w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
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

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-black tabular-nums text-[var(--color-foreground)] font-[family-name:var(--font-display)] leading-none">
              {appPct}%
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted)] mt-0.5">
              {t('adminAnalytics.appShare') || 'App Share'}
            </span>
          </div>
        </div>

        {/* Legend / Breakdown Grid */}
        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-3 sm:pt-4">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] min-w-0">
            <div className="p-2 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--color-foreground)] truncate">
                  {t('adminAnalytics.platformApp') || 'Mobile App'}
                </span>
                <span className="font-bold tabular-nums text-[var(--primary)] shrink-0 ml-1">
                  {appPct}%
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-muted-foreground)] tabular-nums mt-0.5">
                {appUsers} {t('adminAnalytics.totalUsers') || 'users'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] min-w-0">
            <div className="p-2 rounded-lg bg-[var(--info-light)] text-[var(--info)] shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--color-foreground)] truncate">
                  {t('adminAnalytics.platformWeb') || 'Website'}
                </span>
                <span className="font-bold tabular-nums text-[var(--info)] shrink-0 ml-1">
                  {webPct}%
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-muted-foreground)] tabular-nums mt-0.5">
                {webUsers} {t('adminAnalytics.totalUsers') || 'users'}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-platform breakdown pills (Android vs iOS if available) */}
        {platformStats && (platformStats.android > 0 || platformStats.ios > 0) && (
          <div className="mt-2.5 flex items-center justify-between gap-2 px-1 text-[11px] text-[var(--color-muted-foreground)]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
              Android: <strong className="text-[var(--color-foreground)] font-mono">{platformStats.android}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Apple className="w-3 h-3 text-[var(--color-muted)]" />
              iOS: <strong className="text-[var(--color-foreground)] font-mono">{platformStats.ios}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-[var(--info)]" />
              Web: <strong className="text-[var(--color-foreground)] font-mono">{webUsers}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
