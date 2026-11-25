'use client';

import Link from 'next/link';
import { Users, GraduationCap, School, Shield, UserPlus, ArrowUpRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import StatCard from '@/components/ui/StatCard';
import { AdminActivityEngagementCard } from './AdminActivityEngagementCard';
import { AdminFunnelChart } from './AdminFunnelChart';
import type { AdminStats } from './types';

const AdminRoleDistributionChart = dynamic(
  () => import('./AdminRoleDistributionChart').then((m) => m.AdminRoleDistributionChart),
  { ssr: false, loading: () => <div className="h-[340px] teacher-panel animate-pulse" /> }
);
const AdminPlatformDistributionChart = dynamic(
  () => import('./AdminPlatformDistributionChart').then((m) => m.AdminPlatformDistributionChart),
  { ssr: false, loading: () => <div className="h-[340px] teacher-panel animate-pulse" /> }
);
const AdminEngagementBarChart = dynamic(
  () => import('./AdminEngagementBarChart').then((m) => m.AdminEngagementBarChart),
  { ssr: false, loading: () => <div className="h-[320px] teacher-panel animate-pulse" /> }
);

interface AdminUsersTabProps {
  stats: AdminStats;
}

export function AdminUsersTab({ stats }: AdminUsersTabProps) {
  const { t } = useTranslation();

  const total = stats.users.total || 1;
  const studentPct = Math.round((stats.users.students / total) * 100);
  const teacherPct = Math.round((stats.users.teachers / total) * 100);
  const adminPct = Math.round((stats.users.admins / total) * 100);

  const roleShares = [
    {
      label: t('adminAnalytics.totalStudents'),
      count: stats.users.students,
      pct: studentPct,
      icon: GraduationCap,
      iconColor: 'text-[var(--student-primary)]',
      barColor: 'bg-[var(--student-primary)]',
    },
    {
      label: t('adminAnalytics.totalTeachers'),
      count: stats.users.teachers,
      pct: teacherPct,
      icon: School,
      iconColor: 'text-[var(--teacher-primary)]',
      barColor: 'bg-[var(--teacher-primary)]',
    },
    {
      label: t('adminAnalytics.totalAdmins'),
      count: stats.users.admins,
      pct: adminPct,
      icon: Shield,
      iconColor: 'text-sky-500',
      barColor: 'bg-sky-500',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 w-full min-w-0">
      {/* User Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 w-full min-w-0">
        <StatCard
          icon={Users}
          value={stats.users.total}
          label={t('adminAnalytics.totalUsers')}
          color="info"
          delay={0.04}
        />
        <StatCard
          icon={GraduationCap}
          value={stats.users.students}
          label={t('adminAnalytics.totalStudents')}
          color="student"
          delay={0.08}
          description={`${studentPct}% ${t('adminAnalytics.ofTotal')}`}
        />
        <StatCard
          icon={School}
          value={stats.users.teachers}
          label={t('adminAnalytics.totalTeachers')}
          color="teacher"
          delay={0.12}
          description={`${teacherPct}% ${t('adminAnalytics.ofTotal')}`}
        />
        <StatCard
          icon={Shield}
          value={stats.users.admins}
          label={t('adminAnalytics.totalAdmins')}
          color="admin"
          delay={0.16}
          description={`${adminPct}% ${t('adminAnalytics.ofTotal')}`}
        />
        <StatCard
          icon={UserPlus}
          value={stats.users.newThisMonth}
          label={t('adminAnalytics.newThisMonth')}
          color="warning"
          delay={0.2}
        />
      </div>

      {/* Platform & Recency Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
        <AdminPlatformDistributionChart
          platformStats={stats.platformStats}
          totalUsers={stats.users.total}
        />
        <AdminActivityEngagementCard
          activeUsers={stats.activeUsers}
          totalUsers={stats.users.total}
        />
      </div>

      {/* Channel Active Rate & Learner Activation Funnel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
        <AdminEngagementBarChart platformStats={stats.platformStats} />
        <AdminFunnelChart funnel={stats.funnel} />
      </div>

      {/* Role Distribution & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
        <div className="lg:col-span-1 w-full min-w-0">
          <AdminRoleDistributionChart users={stats.users} />
        </div>

        <div className="lg:col-span-2 teacher-panel p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--border)]/70">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
                {t('adminAnalytics.roleDistributionTitle')}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                {t('adminAnalytics.roleDistributionSubtitle')}
              </p>
            </div>
            <Link
              href={ROUTES.admin.users}
              className="teacher-cta-btn min-h-[40px] px-3.5 text-xs shrink-0 self-start sm:self-auto"
            >
              <span>{t('adminAnalytics.manageUsers')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {roleShares.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-3.5 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]/70 space-y-2"
                >
                  <div className="flex justify-between items-center text-xs font-bold text-[var(--color-foreground)]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="tabular-nums shrink-0 ml-2">
                      {item.count.toLocaleString()}{' '}
                      <span className="text-[var(--color-muted-foreground)] font-semibold">
                        ({item.pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-[var(--surface-muted-strong)] rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.barColor} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
