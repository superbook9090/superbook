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
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">{t('charts.average')}</span>
              <span className="text-sm font-bold text-[var(--student-primary)]">
                {data.displayAverage}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">{t('charts.trend')}</span>
              <span className="text-sm font-bold text-[var(--student-accent)]">
                {data.displayMovingAverage}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">{t('charts.attempts')}</span>
              <span className="text-sm text-gray-500">{data.attemptCount}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!processedData || processedData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm h-[300px] flex flex-col items-center justify-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-500 text-center">{t('charts.noScoreData')}</p>
        <p className="text-gray-400 text-sm text-center mt-1">{t('charts.completeMoreQuizzes')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{resolvedTitle}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>{t('charts.sevenDayMovingAverage')}</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
  );
}
