'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, GraduationCap, School, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AdminRoleDistributionChartProps {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
  };
}

export function AdminRoleDistributionChart({ users }: AdminRoleDistributionChartProps) {
  const { t } = useTranslation();

  const roleData = useMemo(() => {
    const total = users.total || 1;
    return [
      {
        name: t('adminAnalytics.totalStudents'),
        role: 'student',
        value: users.students,
        percentage: Math.round((users.students / total) * 100) || 0,
        color: 'var(--student-primary)',
        icon: GraduationCap,
      },
      {
        name: t('adminAnalytics.totalTeachers'),
        role: 'teacher',
        value: users.teachers,
        percentage: Math.round((users.teachers / total) * 100) || 0,
        color: 'var(--teacher-accent)',
        icon: School,
      },
      {
        name: t('adminAnalytics.totalAdmins'),
        role: 'admin',
        value: users.admins,
        percentage: Math.round((users.admins / total) * 100) || 0,
        color: 'var(--info)',
        icon: Shield,
      },
    ];
  }, [users, t]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const Icon = data.icon;
      return (
        <div className="bg-[var(--card-solid)] p-2.5 rounded-xl shadow-xl border border-[var(--color-border)] min-w-[130px] text-xs">
          <div className="flex items-center gap-1.5 mb-1 font-semibold text-[var(--color-foreground)]">
            <Icon className="w-3.5 h-3.5" style={{ color: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm sm:text-base font-bold tabular-nums text-[var(--color-foreground)]">
              {data.value}
            </span>
            <span className="text-xs font-semibold" style={{ color: data.color }}>
              {data.percentage}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-panel flex flex-col h-full justify-between w-full min-w-0 overflow-hidden">
      <div className="card-panel-header">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
            <Users className="w-4 h-4" />
          </span>
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-foreground)] truncate">
            {t('adminAnalytics.roleDistributionTitle')}
          </h3>
        </div>
        <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
          {t('adminAnalytics.roleDistributionSubtitle')}
        </p>
      </div>

      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-center w-full min-w-0">
        <div className="h-[180px] sm:h-[200px] relative w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card-solid)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-black tabular-nums text-[var(--color-foreground)] font-[family-name:var(--font-display)] leading-none">
              {users.total}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted)] mt-0.5">
              {t('adminAnalytics.totalUsers')}
            </span>
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-2 border-t border-[var(--color-border)] pt-3 sm:pt-4">
          {roleData.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.role} className="flex flex-col items-center text-center min-w-0">
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[var(--color-muted-foreground)] font-medium max-w-full truncate">
                  <Icon className="w-3 h-3 shrink-0" style={{ color: item.color }} />
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="text-xs sm:text-sm font-bold tabular-nums text-[var(--color-foreground)] mt-0.5">
                  {item.value}
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold text-[var(--color-muted)]">
                  {item.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
