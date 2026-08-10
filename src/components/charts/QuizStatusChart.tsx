'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart as PieChartIcon, CheckCircle, Clock, Circle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface QuizStatusData {
  name: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: QuizStatusData;
    value: number;
  }>;
}

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

interface QuizStatusChartProps {
  data: QuizStatusData[];
  title?: string;
  height?: number;
}

const DEFAULT_COLORS = {
  completed: 'var(--success)',
  inProgress: 'var(--warning)',
  notStarted: 'var(--color-muted-foreground)',
};

const DEFAULT_ICONS = {
  completed: <CheckCircle className="w-4 h-4" />,
  inProgress: <Clock className="w-4 h-4" />,
  notStarted: <Circle className="w-4 h-4" />,
};

export default function QuizStatusChart({ 
  data, 
  title,
  height = 300 
}: QuizStatusChartProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('charts.quizStatusDistribution');
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .map(item => ({
        ...item,
        color: item.color || DEFAULT_COLORS[item.name as keyof typeof DEFAULT_COLORS] || '#6b7280',
        icon: item.icon || DEFAULT_ICONS[item.name as keyof typeof DEFAULT_ICONS] || <Circle className="w-4 h-4" />
      }))
      .filter(item => item.value > 0);
  }, [data]);

  const totalQuizzes = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.value, 0);
  }, [processedData]);

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalQuizzes) * 100).toFixed(1);
      return (
        <div className="bg-[var(--card-solid)] p-2 sm:p-3 rounded-lg shadow-lg border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            {data.icon}
            <p className="text-xs sm:text-sm font-medium text-[var(--color-foreground)] capitalize">{data.name}</p>
          </div>
          <p className="text-base sm:text-lg font-bold" style={{ color: data.color }}>
            {t('charts.quizzesCount', { count: data.value })}
          </p>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">{t('charts.percentOfTotal', { percent: percentage })}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomLabelProps) => {
    if (cx === undefined || cy === undefined || midAngle === undefined || 
        innerRadius === undefined || outerRadius === undefined || percent === undefined) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for slices smaller than 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

interface LegendEntryProps {
  value?: string | number;
  payload?: QuizStatusData | object;
  color?: string;
}

const renderCustomizedLabel = (props: CustomLabelProps) => {
  return <CustomLabel {...props} />;
};

  if (!processedData || processedData.length === 0) {
    return (
      <div className="card-surface card-body h-[250px] sm:h-[300px] flex flex-col items-center justify-center p-4">
        <PieChartIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-muted)] mb-2 sm:mb-3" />
        <p className="text-[var(--color-muted-foreground)] text-sm sm:text-base text-center">{t('charts.noQuizData')}</p>
        <p className="text-[var(--color-muted)] text-xs sm:text-sm text-center mt-1">{t('charts.takeQuizzesToSeeEngagement')}</p>
      </div>
    );
  }

  return (
    <div className="card-surface card-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">{resolvedTitle}</h3>
        <div className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {t('charts.totalQuizzes', { count: totalQuizzes })}
        </div>
      </div>
      
      <div className={`w-full ${height === 300 ? 'h-[250px] sm:h-[300px]' : ''}`} style={{ height: height === 300 ? undefined : height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: LegendEntryProps) => (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span style={{ color: entry.color }}>
                    {entry.payload && 'icon' in entry.payload ? entry.payload.icon : null}
                  </span>
                  <span className="capitalize">{value}</span>
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
