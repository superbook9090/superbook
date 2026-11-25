'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { DailyQuizScorePoint } from './types';

interface AdminQuizTrendChartProps {
  data?: DailyQuizScorePoint[];
}

export function AdminQuizTrendChart({ data = [] }: AdminQuizTrendChartProps) {
  const { t } = useTranslation();

  const processed = useMemo(
    () =>
      data.map((pt) => ({
        ...pt,
        displayDate: new Date(pt.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
      })),
    [data]
  );

  const hasActivity = processed.some((p) => p.attempts > 0);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    const pt = payload[0].payload as DailyQuizScorePoint;
    return (
      <div className="bg-[var(--card-solid)] p-3 rounded-xl shadow-xl border border-[var(--border)] min-w-[155px] text-xs space-y-1.5">
        <p className="font-bold text-[var(--color-foreground)] border-b border-[var(--border)] pb-1">
          {label}
        </p>
        <div className="flex items-center justify-between gap-3 tabular-nums">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--teacher-primary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--teacher-primary)]" />
            {t('adminAnalytics.attempts')}
          </span>
          <strong className="text-[var(--color-foreground)]">{pt.attempts}</strong>
        </div>
        <div className="flex items-center justify-between gap-3 tabular-nums">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {t('adminAnalytics.avgScore')}
          </span>
          <strong className="text-[var(--color-foreground)]">{pt.avgScore}%</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="teacher-panel p-4 sm:p-5 h-full flex flex-col justify-between gap-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[var(--border)]/70">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.quizTrendTitle')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
              {t('adminAnalytics.quizTrendSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold text-[var(--color-muted-foreground)] shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--teacher-primary)]/70" />
            {t('adminAnalytics.attempts')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded-full bg-emerald-500" />
            {t('adminAnalytics.avgScore')}
          </span>
        </div>
      </div>

      {!hasActivity ? (
        <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-8 h-8 text-[var(--color-muted-foreground)] opacity-50 mb-2" />
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            {t('progress.noDataAvailable')}
          </p>
        </div>
      ) : (
        <div className="w-full min-w-0 h-[230px] sm:h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processed} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
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
                yAxisId="left"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={34}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                stroke="#10b981"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={38}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId="left"
                dataKey="attempts"
                fill="var(--teacher-primary)"
                fillOpacity={0.35}
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgScore"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
