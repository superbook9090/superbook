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
  title = "Quiz Status Distribution",
  height = 300 
}: QuizStatusChartProps) {
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
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            {data.icon}
            <p className="text-sm font-medium text-gray-900 capitalize">{data.name}</p>
          </div>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {data.value} quizzes
          </p>
          <p className="text-sm text-gray-500">{percentage}% of total</p>
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
      <div className="bg-white rounded-2xl p-5 shadow-sm h-[300px] flex flex-col items-center justify-center">
        <PieChartIcon className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-500 text-center">No quiz data available</p>
        <p className="text-gray-400 text-sm text-center mt-1">Take quizzes to see your engagement</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          {totalQuizzes} total quizzes
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
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
              <div className="flex items-center gap-2">
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
  );
}
