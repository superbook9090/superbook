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
import { TrendingUp, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AverageScoreData {
  date: string;
  averageScore: number;
  movingAverage: number;
  attemptCount: number;
  displayAverage?: number;
  displayMovingAverage?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AverageScoreData;
    value: number;
  }>;
  label?: string;
}

interface AverageScoreChartProps {
  data: AverageScoreData[];
  title?: string;
  height?: number;
}

export default function AverageScoreChart({ 
  data, 
  title,
  height = 300 
}: AverageScoreChartProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('charts.averageScoreTrend');
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        displayAverage: Math.round(item.averageScore),
        displayMovingAverage: Math.round(item.movingAverage)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[var(--card-solid)] p-2 sm:p-3 rounded-lg shadow-lg border border-[var(--color-border)]">
          <p className="text-xs sm:text-sm font-medium text-[var(--color-foreground)]">{label}</p>
          <div className="mt-1 sm:mt-2 space-y-1">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">{t('charts.average')}</span>
              <span className="text-xs sm:text-sm font-bold text-[var(--student-primary)]">
                {data.displayAverage}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">{t('charts.trend')}</span>
              <span className="text-xs sm:text-sm font-bold text-[var(--student-accent)]">
                {data.displayMovingAverage}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">{t('charts.attempts')}</span>
              <span className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">{data.attemptCount}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!processedData || processedData.length === 0) {
    return (
      <div className="card-surface card-body h-[250px] sm:h-[300px] flex flex-col items-center justify-center p-4">
        <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-muted)] mb-2 sm:mb-3" />
        <p className="text-[var(--color-muted-foreground)] text-sm sm:text-base text-center">{t('charts.noScoreData')}</p>
        <p className="text-[var(--color-muted)] text-xs sm:text-sm text-center mt-1">{t('charts.completeMoreQuizzes')}</p>
      </div>
    );
  }

  return (
    <div className="card-surface card-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">{resolvedTitle}</h3>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{t('charts.sevenDayMovingAverage')}</span>
        </div>
      </div>
      
      <div className={`w-full ${height === 300 ? 'h-[250px] sm:h-[300px]' : ''}`} style={{ height: height === 300 ? undefined : height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="averageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--student-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--student-primary)" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="movingAverageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--student-accent)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--student-accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
          
          {/* Moving Average Area */}
          <Area
            type="monotone"
            dataKey="displayMovingAverage"
            stroke="var(--student-accent)"
            strokeWidth={2}
            fill="url(#movingAverageGradient)"
            dot={false}
          />
          
          {/* Daily Average Area */}
          <Area
            type="monotone"
            dataKey="displayAverage"
            stroke="var(--student-primary)"
            strokeWidth={2}
            fill="url(#averageGradient)"
            dot={{ fill: 'var(--student-primary)', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
