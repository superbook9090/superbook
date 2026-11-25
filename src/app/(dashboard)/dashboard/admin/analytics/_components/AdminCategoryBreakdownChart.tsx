'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { FolderKanban } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { CategoryBreakdownItem } from './types';

interface AdminCategoryBreakdownChartProps {
  data?: CategoryBreakdownItem[];
}

type CategoryMetric = 'enrollments' | 'courses';

export function AdminCategoryBreakdownChart({ data = [] }: AdminCategoryBreakdownChartProps) {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<CategoryMetric>('enrollments');

  const chartData = data.map((item) => ({
    ...item,
    shortCategory:
      item.category.length > 16 ? `${item.category.slice(0, 15)}…` : item.category,
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
  }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload as CategoryBreakdownItem;
    return (
      <div className="bg-[var(--card-solid)] p-3 rounded-xl shadow-xl border border-[var(--border)] min-w-[165px] text-xs space-y-1.5">
        <p className="font-bold text-[var(--color-foreground)] border-b border-[var(--border)] pb-1">
          {item.category}
        </p>
        <div className="flex items-center justify-between gap-3 tabular-nums">
          <span className="text-[var(--color-muted-foreground)]">{t('adminAnalytics.enrollments')}</span>
          <strong className="text-[var(--teacher-primary)]">{item.enrollments.toLocaleString()}</strong>
        </div>
        <div className="flex items-center justify-between gap-3 tabular-nums">
          <span className="text-[var(--color-muted-foreground)]">{t('adminAnalytics.totalCourses')}</span>
          <strong className="text-[var(--color-foreground)]">
            {item.courses} ({item.published} {t('adminAnalytics.published')})
          </strong>
        </div>
      </div>
    );
  };

  return (
    <div className="teacher-panel p-4 sm:p-5 h-full flex flex-col justify-between gap-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--border)]/70">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
            <FolderKanban className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.categoryBreakdownTitle')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
              {t('adminAnalytics.categoryBreakdownSubtitle')}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] self-start sm:self-auto shrink-0">
          {(
            [
              { id: 'enrollments' as CategoryMetric, label: t('adminAnalytics.enrollments') },
              { id: 'courses' as CategoryMetric, label: t('adminAnalytics.totalCourses') },
            ]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMetric(opt.id)}
              className={`px-2.5 min-h-[32px] text-xs font-bold rounded-[8px] transition-colors cursor-pointer whitespace-nowrap ${
                metric === opt.id
                  ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 min-h-[240px] flex flex-col items-center justify-center text-center">
          <FolderKanban className="w-8 h-8 text-[var(--color-muted-foreground)] opacity-50 mb-2" />
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            {t('progress.noDataAvailable')}
          </p>
        </div>
      ) : (
        <div className="w-full min-w-0 h-[260px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="shortCategory"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={108}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-muted)', opacity: 0.5 }} />
              <Bar
                dataKey={metric}
                fill={metric === 'enrollments' ? 'var(--teacher-primary)' : 'var(--info)'}
                radius={[0, 8, 8, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
