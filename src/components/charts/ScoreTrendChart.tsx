'use client';

import { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import type { CustomTooltipProps, ScoreTrendChartProps } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';




export default function ScoreTrendChart({ 
  data, 
  title,
  height = 300 
}: ScoreTrendChartProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('charts.scoreTrend');
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        displayScore: Math.round(item.score)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-[var(--card-solid)] p-3 rounded-lg shadow-lg border border-[var(--color-border)]">
          <p className="text-sm font-medium text-[var(--color-foreground)]">{label}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{payload[0].payload.quizTitle}</p>
          <p className="text-lg font-bold text-[var(--student-primary)]">
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (!processedData || processedData.length === 0) {
    return (
      <div className="bg-[var(--card-solid)] rounded-2xl p-5 shadow-sm h-[300px] flex flex-col items-center justify-center">
        <Calendar className="w-12 h-12 text-[var(--color-muted)] mb-3" />
        <p className="text-[var(--color-muted-foreground)] text-center">{t('charts.noQuizAttemptsYet')}</p>
        <p className="text-[var(--color-muted)] text-sm text-center mt-1">{t('charts.startQuizzesToSeeProgress')}</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-solid)] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{resolvedTitle}</h3>
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
          <TrendingUp className="w-4 h-4" />
          <span>{t('charts.attemptsCount', { count: processedData.length })}</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--student-primary)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--student-primary)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="displayScore"
            stroke="var(--student-primary)"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={{ fill: 'var(--student-primary)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
