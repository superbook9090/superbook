'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { DailyTrendPoint } from './types';

interface AdminActivityChartProps {
  data: DailyTrendPoint[];
}

type MetricFilter = 'all' | 'signups' | 'enrollments' | 'attempts';

interface TooltipPayload {
  payload: DailyTrendPoint;
  value: number;
}

export function AdminActivityChart({ data }: AdminActivityChartProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<MetricFilter>('all');

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item) => {
      const d = new Date(item.date);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return {
        ...item,
        displayDate: label,
      };
    });
  }, [data]);

  const filterOptions: { id: MetricFilter; label: string; color: string }[] = [
    { id: 'all', label: t('adminAnalytics.allSeries'), color: 'bg-[var(--primary)] text-white' },
    { id: 'signups', label: t('adminAnalytics.signups'), color: 'bg-[var(--info)] text-white' },
    { id: 'enrollments', label: t('adminAnalytics.enrollments'), color: 'bg-[var(--success)] text-white' },
    { id: 'attempts', label: t('adminAnalytics.attempts'), color: 'bg-[var(--warning)] text-white' },
  ];

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-[var(--card-solid)] p-2.5 sm:p-3 rounded-xl shadow-xl border border-[var(--color-border)] min-w-[140px] text-xs">
          <p className="font-semibold text-[var(--color-foreground)] border-b border-[var(--color-border)] pb-1 mb-1.5">
            {label}
          </p>
          <div className="space-y-1">
            {(filter === 'all' || filter === 'signups') && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--info)] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--info)]" />
                  {t('adminAnalytics.signups')}
                </span>
                <span className="font-bold tabular-nums text-[var(--color-foreground)]">{point.signups}</span>
              </div>
            )}
            {(filter === 'all' || filter === 'enrollments') && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--success)] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  {t('adminAnalytics.enrollments')}
                </span>
                <span className="font-bold tabular-nums text-[var(--color-foreground)]">{point.enrollments}</span>
              </div>
            )}
            {(filter === 'all' || filter === 'attempts') && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--warning)] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                  {t('adminAnalytics.attempts')}
                </span>
                <span className="font-bold tabular-nums text-[var(--color-foreground)]">{point.attempts}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!processedData || processedData.length === 0) {
    return (
      <div className="card-panel p-6 text-center flex flex-col items-center justify-center min-h-[260px]">
        <Activity className="w-8 h-8 text-[var(--color-muted)] mb-2 animate-pulse" />
        <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm">{t('progress.noDataAvailable')}</p>
      </div>
    );
  }

  return (
    <div className="card-panel w-full min-w-0 overflow-hidden">
      <div className="card-panel-header flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.growthTrendTitle')}
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
            {t('adminAnalytics.growthTrendSubtitle')}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto max-w-full shrink-0">
          {filterOptions.map((opt) => {
            const isActive = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id)}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 touch-target ${
                  isActive
                    ? opt.color
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 sm:p-5 pt-1 sm:pt-2 w-full min-w-0">
        <div className="w-full min-w-0 h-[220px] sm:h-[260px] md:h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--info)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--info)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="attemptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--warning)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="var(--color-muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={6}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                dx={-4}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />

              {(filter === 'all' || filter === 'signups') && (
                <Area
                  type="monotone"
                  dataKey="signups"
                  stroke="var(--info)"
                  strokeWidth={2}
                  fill="url(#signupGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}

              {(filter === 'all' || filter === 'enrollments') && (
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="var(--success)"
                  strokeWidth={2}
                  fill="url(#enrollGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}

              {(filter === 'all' || filter === 'attempts') && (
                <Area
                  type="monotone"
                  dataKey="attempts"
                  stroke="var(--warning)"
                  strokeWidth={2}
                  fill="url(#attemptGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
