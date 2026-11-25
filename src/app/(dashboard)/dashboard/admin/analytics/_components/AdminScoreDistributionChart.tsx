'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Award, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { ScoreBandItem, ScoreTierCounts } from './types';

interface AdminScoreDistributionChartProps {
  data?: ScoreBandItem[];
  scoreTiers?: ScoreTierCounts;
}

const BAND_COLORS: Record<string, string> = {
  '0-39': '#f43f5e',
  '40-59': '#f59e0b',
  '60-79': '#0ea5e9',
  '80-89': 'var(--teacher-primary)',
  '90-100': '#10b981',
};

export function AdminScoreDistributionChart({
  data = [],
  scoreTiers,
}: AdminScoreDistributionChartProps) {
  const { t } = useTranslation();

  const totalAttempts = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
  }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload as ScoreBandItem;
    const color = BAND_COLORS[item.band] || 'var(--teacher-primary)';
    return (
      <div className="bg-[var(--card-solid)] p-2.5 rounded-xl shadow-xl border border-[var(--border)] min-w-[140px] text-xs">
        <p className="font-bold text-[var(--color-foreground)] mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span>{item.label}</span>
        </p>
        <div className="flex items-baseline justify-between gap-3 tabular-nums">
          <span className="text-sm font-extrabold text-[var(--color-foreground)]">
            {item.count.toLocaleString()}
          </span>
          <span className="font-bold" style={{ color }}>
            {item.percentage}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="teacher-panel p-4 sm:p-5 h-full flex flex-col justify-between gap-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[var(--border)]/70">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
            <Award className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.scoreDistributionTitle')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
              {t('adminAnalytics.scoreDistributionSubtitle')}
            </p>
          </div>
        </div>

        {scoreTiers && totalAttempts > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold shrink-0 self-start sm:self-auto tabular-nums">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{scoreTiers.passRate}% {t('adminAnalytics.passRate')}</span>
          </span>
        )}
      </div>

      {totalAttempts === 0 ? (
        <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center">
          <Award className="w-8 h-8 text-[var(--color-muted-foreground)] opacity-50 mb-2" />
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            {t('progress.noDataAvailable')}
          </p>
        </div>
      ) : (
        <div className="w-full min-w-0 h-[230px] sm:h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
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
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={44}>
                {data.map((entry) => (
                  <Cell
                    key={entry.band}
                    fill={BAND_COLORS[entry.band] || 'var(--teacher-primary)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
