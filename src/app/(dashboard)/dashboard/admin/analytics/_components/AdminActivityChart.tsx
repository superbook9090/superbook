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
type SeriesKey = 'signups' | 'enrollments' | 'attempts';

interface TooltipPayload {
  payload: DailyTrendPoint;
  value: number;
}

const SERIES_META: {
  key: SeriesKey;
  labelKey: string;
  colorVar: string;
  dotClass: string;
  textClass: string;
  gradId: string;
}[] = [
  { key: 'signups', labelKey: 'adminAnalytics.signups', colorVar: 'var(--info)', dotClass: 'bg-[var(--info)]', textClass: 'text-[var(--info)]', gradId: 'signupGrad' },
  { key: 'enrollments', labelKey: 'adminAnalytics.enrollments', colorVar: 'var(--success)', dotClass: 'bg-[var(--success)]', textClass: 'text-[var(--success)]', gradId: 'enrollGrad' },
  { key: 'attempts', labelKey: 'adminAnalytics.attempts', colorVar: 'var(--warning)', dotClass: 'bg-[var(--warning)]', textClass: 'text-[var(--warning)]', gradId: 'attemptGrad' },
];

export function AdminActivityChart({ data }: AdminActivityChartProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<MetricFilter>('all');

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item) => ({
      ...item,
      displayDate: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }));
  }, [data]);

  const seriesTotals = useMemo(
    () =>
      processedData.reduce(
        (acc, pt) => ({
          signups: acc.signups + (pt.signups || 0),
          enrollments: acc.enrollments + (pt.enrollments || 0),
          attempts: acc.attempts + (pt.attempts || 0),
        }),
        { signups: 0, enrollments: 0, attempts: 0 }
      ),
    [processedData]
  );

  const visibleSeries = useMemo(
    () => (filter === 'all' ? SERIES_META : SERIES_META.filter((s) => s.key === filter)),
    [filter]
  );

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
      <div className="bg-[var(--card-solid)] p-3 rounded-xl shadow-xl border border-[var(--border)] min-w-[155px] text-xs">
        <p className="font-bold text-[var(--color-foreground)] border-b border-[var(--border)] pb-1.5 mb-2">
          {label}
        </p>
        <div className="space-y-1.5">
          {visibleSeries.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-3">
              <span className={`${s.textClass} inline-flex items-center gap-1.5 font-semibold`}>
                <span className={`w-2 h-2 rounded-full ${s.dotClass}`} />
                {t(s.labelKey)}
              </span>
              <span className="font-bold tabular-nums text-[var(--color-foreground)]">
                {point[s.key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (processedData.length === 0) {
    return (
      <div className="teacher-panel p-6 text-center flex flex-col items-center justify-center min-h-[320px]">
        <Activity className="w-8 h-8 text-[var(--color-muted-foreground)] mb-2 opacity-60" />
        <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm">{t('progress.noDataAvailable')}</p>
      </div>
    );
  }

  return (
    <div className="teacher-panel p-4 sm:p-5 h-full flex flex-col justify-between gap-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--border)]/70">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.growthTrendTitle')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
              {t('adminAnalytics.growthTrendSubtitle')}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] overflow-x-auto max-w-full scrollbar-none shrink-0">
          {([
            { id: 'all' as MetricFilter, label: t('adminAnalytics.allSeries'), dot: undefined },
            ...SERIES_META.map((s) => ({ id: s.key as MetricFilter, label: t(s.labelKey), dot: s.dotClass })),
          ]).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 min-h-[32px] text-xs font-bold rounded-[8px] transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                filter === opt.id
                  ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {opt.dot && <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Period Totals Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        {SERIES_META.map((s) => (
          <div
            key={s.key}
            className="px-3 py-2 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]/60 flex items-center justify-between gap-2"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-muted-foreground)] truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.dotClass}`} />
              <span className="truncate">{t(s.labelKey)}</span>
            </span>
            <span className="text-xs sm:text-sm font-extrabold tabular-nums text-[var(--color-foreground)] shrink-0">
              {seriesTotals[s.key].toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <div className="w-full min-w-0 h-[230px] sm:h-[270px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              {SERIES_META.map((s) => (
                <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.colorVar} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.colorVar} stopOpacity={0.01} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={6}
              interval="preserveStartEnd"
              minTickGap={18}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={34}
            />
            <Tooltip content={<CustomTooltip />} />

            {visibleSeries.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.colorVar}
                strokeWidth={2.2}
                fill={`url(#${s.gradId})`}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
