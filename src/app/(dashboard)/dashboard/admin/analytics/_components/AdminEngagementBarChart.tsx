'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Smartphone, Globe, BarChart2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PlatformStats } from './types';

interface AdminEngagementBarChartProps {
  platformStats?: PlatformStats;
}

export function AdminEngagementBarChart({ platformStats }: AdminEngagementBarChartProps) {
  const { t } = useTranslation();

  const totalApp = platformStats?.totalApp ?? 0;
  const activeApp = platformStats?.activeApp ?? 0;
  const totalWeb = platformStats?.totalWeb ?? 0;
  const activeWeb = platformStats?.activeWeb ?? 0;

  const appRate = totalApp > 0 ? Math.round((activeApp / totalApp) * 100) : 0;
  const webRate = totalWeb > 0 ? Math.round((activeWeb / totalWeb) * 100) : 0;

  const chartData = [
    {
      channel: t('adminAnalytics.platformApp'),
      registered: totalApp,
      active30d: activeApp,
      rate: appRate,
    },
    {
      channel: t('adminAnalytics.platformWeb'),
      registered: totalWeb,
      active30d: activeWeb,
      rate: webRate,
    },
  ];

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
  }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload as (typeof chartData)[number];
    return (
      <div className="bg-[var(--card-solid)] p-3 rounded-xl shadow-xl border border-[var(--border)] min-w-[160px] text-xs space-y-1.5">
        <p className="font-bold text-[var(--color-foreground)] border-b border-[var(--border)] pb-1">
          {row.channel}
        </p>
        <div className="flex items-center justify-between gap-3 tabular-nums">
          <span className="text-[var(--color-muted-foreground)]">{t('adminAnalytics.registeredLabel')}</span>
          <strong className="text-[var(--color-foreground)]">{row.registered.toLocaleString()}</strong>
        </div>
        <div className="flex items-center justify-between gap-3 tabular-nums">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('adminAnalytics.active30dLabel')}</span>
          <strong className="text-emerald-600 dark:text-emerald-400">{row.active30d.toLocaleString()} ({row.rate}%)</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="teacher-panel p-4 sm:p-5 h-full flex flex-col justify-between gap-4 overflow-hidden">
      <div className="flex items-start gap-2.5 pb-3.5 border-b border-[var(--border)]/70">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-sky-500/12 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
          <BarChart2 className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
            {t('adminAnalytics.platformEngagementTitle')}
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
            {t('adminAnalytics.platformEngagementSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]/70 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-foreground)] truncate">
            <Smartphone className="w-3.5 h-3.5 text-[var(--teacher-primary)] shrink-0" />
            <span className="truncate">{t('adminAnalytics.platformApp')}</span>
          </span>
          <span className="text-xs font-extrabold tabular-nums text-[var(--teacher-primary)] shrink-0">
            {appRate}% {t('adminAnalytics.activeRate')}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]/70 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-foreground)] truncate">
            <Globe className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="truncate">{t('adminAnalytics.platformWeb')}</span>
          </span>
          <span className="text-xs font-extrabold tabular-nums text-sky-600 dark:text-sky-400 shrink-0">
            {webRate}% {t('adminAnalytics.activeRate')}
          </span>
        </div>
      </div>

      <div className="w-full min-w-0 h-[210px] sm:h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="channel"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-muted)', opacity: 0.5 }} />
            <Bar
              dataKey="registered"
              name={t('adminAnalytics.registeredLabel')}
              fill="var(--info)"
              fillOpacity={0.35}
              radius={[8, 8, 0, 0]}
              maxBarSize={44}
            />
            <Bar
              dataKey="active30d"
              name={t('adminAnalytics.active30dLabel')}
              fill="#10b981"
              radius={[8, 8, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
