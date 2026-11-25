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
        color: 'var(--teacher-primary)',
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
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const Icon = data.icon;
    return (
      <div className="bg-[var(--card-solid)] p-2.5 rounded-xl shadow-xl border border-[var(--border)] min-w-[135px] text-xs">
        <div className="flex items-center gap-1.5 mb-1 font-bold text-[var(--color-foreground)]">
          <Icon className="w-3.5 h-3.5" style={{ color: data.color }} />
          <span>{data.name}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 tabular-nums">
          <span className="text-sm font-extrabold text-[var(--color-foreground)]">
            {data.value.toLocaleString()}
          </span>
          <span className="text-xs font-bold" style={{ color: data.color }}>
            {data.percentage}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="teacher-panel p-4 sm:p-5 h-full flex flex-col justify-between gap-4 overflow-hidden">
      <div className="flex items-start gap-2.5 pb-3.5 border-b border-[var(--border)]/70">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
          <Users className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
            {t('adminAnalytics.roleDistributionTitle')}
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
            {t('adminAnalytics.roleDistributionSubtitle')}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="h-[190px] relative w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={78}
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

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold tabular-nums text-[var(--color-foreground)] font-[family-name:var(--font-display)] leading-none">
              {users.total.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted-foreground)] mt-1">
              {t('adminAnalytics.totalUsers')}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 pt-3.5 border-t border-[var(--border)]/70">
          {roleData.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                className="flex flex-col items-center text-center p-2 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]/60 min-w-0"
              >
                <div className="flex items-center gap-1 text-[10px] text-[var(--color-muted-foreground)] font-semibold max-w-full truncate">
                  <Icon className="w-3 h-3 shrink-0" style={{ color: item.color }} />
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="text-sm font-extrabold tabular-nums text-[var(--color-foreground)] mt-0.5">
                  {item.value.toLocaleString()}
                </div>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: item.color }}>
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
