'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BookOpen, Target } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface CourseData {
  courseTitle: string;
  progress: number;
  status: 'completed' | 'active' | 'inactive';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CourseData;
    value: number;
  }>;
  label?: string;
}

interface CourseProgressChartProps {
  data: CourseData[];
  title?: string;
  height?: number;
}

export default function CourseProgressChart({ 
  data, 
  title,
  height = 300 
}: CourseProgressChartProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('charts.courseProgress');
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .map(item => ({
        ...item,
        displayName: item.courseTitle.length > 15 
          ? item.courseTitle.substring(0, 15) + '...' 
          : item.courseTitle,
        displayProgress: Math.round(item.progress)
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 10); // Show top 10 courses
  }, [data]);

  const getBarColor = (status: string, progress: number) => {
    if (status === 'completed') return 'var(--success)';
    if (progress >= 75) return 'var(--student-primary)';
    if (progress >= 50) return 'var(--student-accent)';
    return 'var(--warning)';
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-[var(--card-solid)] p-3 rounded-lg shadow-lg border border-[var(--color-border)]">
          <p className="text-sm font-medium text-[var(--color-foreground)]">{data.courseTitle}</p>
          <p className="text-lg font-bold" style={{ color: getBarColor(data.status, data.progress) }}>
            {data.progress}%
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)] capitalize">{data.status}</p>
        </div>
      );
    }
    return null;
  };

  if (!processedData || processedData.length === 0) {
    return (
        <div className="card-surface card-body h-[300px] flex flex-col items-center justify-center">
        <BookOpen className="w-12 h-12 text-[var(--color-muted)] mb-3" />
        <p className="text-[var(--color-muted-foreground)] text-center">{t('charts.noCourseData')}</p>
        <p className="text-[var(--color-muted)] text-sm text-center mt-1">{t('charts.enrollToTrackProgress')}</p>
        </div>
      );
  }

  return (
    <div className="card-surface card-body">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{resolvedTitle}</h3>
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
          <Target className="w-4 h-4" />
          <span>{t('charts.coursesCount', { count: processedData.length })}</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={processedData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            type="number"
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <YAxis 
            type="category"
            dataKey="displayName"
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="displayProgress" 
            radius={[0, 8, 8, 0]}
            maxBarSize={40}
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry.status, entry.progress)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
