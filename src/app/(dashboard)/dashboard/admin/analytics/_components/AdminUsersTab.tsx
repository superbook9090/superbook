'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, GraduationCap, School, Shield, UserPlus, ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import StatCard from '@/components/ui/StatCard';
import { AdminRoleDistributionChart } from './AdminRoleDistributionChart';
import type { AdminStats } from './types';

interface AdminUsersTabProps {
  stats: AdminStats;
}

export function AdminUsersTab({ stats }: AdminUsersTabProps) {
  const { t } = useTranslation();

  const total = stats.users.total || 1;
  const studentPct = Math.round((stats.users.students / total) * 100);
  const teacherPct = Math.round((stats.users.teachers / total) * 100);
  const adminPct = Math.round((stats.users.admins / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 sm:space-y-6 w-full min-w-0"
    >
      {/* User Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 w-full min-w-0">
        <StatCard
          icon={Users}
          value={stats.users.total}
          label={t('adminAnalytics.totalUsers')}
          color="info"
          delay={0.05}
        />
        <StatCard
          icon={GraduationCap}
          value={stats.users.students}
          label={t('adminAnalytics.totalStudents')}
          color="student"
          delay={0.1}
          suffix={` (${studentPct}%)`}
        />
        <StatCard
          icon={School}
          value={stats.users.teachers}
          label={t('adminAnalytics.totalTeachers')}
          color="teacher"
          delay={0.15}
          suffix={` (${teacherPct}%)`}
        />
        <StatCard
          icon={Shield}
          value={stats.users.admins}
          label={t('adminAnalytics.totalAdmins')}
          color="admin"
          delay={0.2}
          suffix={` (${adminPct}%)`}
        />
        <StatCard
          icon={UserPlus}
          value={stats.users.newThisMonth}
          label={t('adminAnalytics.newThisMonth')}
          color="warning"
          delay={0.25}
        />
      </div>

      {/* Role Breakdown & User Management Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
        <div className="lg:col-span-1 w-full min-w-0">
          <AdminRoleDistributionChart users={stats.users} />
        </div>

        <div className="lg:col-span-2 card-panel flex flex-col justify-between w-full min-w-0">
          <div className="card-panel-header flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-foreground)] truncate">
                {t('adminAnalytics.roleDistributionTitle')}
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                {t('adminAnalytics.roleDistributionSubtitle')}
              </p>
            </div>
            <Link
              href={ROUTES.admin.users}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto shrink-0"
            >
              <span>{t('adminAnalytics.manageUsers')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card-panel-body space-y-4 sm:space-y-5">
            {/* Student Share */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--color-foreground)] mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <GraduationCap className="w-4 h-4 text-[var(--student-primary)] shrink-0" />
                  <span className="truncate">{t('adminAnalytics.totalStudents')}</span>
                </div>
                <span className="font-bold tabular-nums shrink-0 ml-2">
                  {stats.users.students} ({studentPct}%)
                </span>
              </div>
              <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-2.5">
                <div
                  className="bg-[var(--student-primary)] h-2.5 rounded-full transition-all"
                  style={{ width: `${studentPct}%` }}
                />
              </div>
            </div>

            {/* Teacher Share */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--color-foreground)] mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <School className="w-4 h-4 text-[var(--teacher-accent)] shrink-0" />
                  <span className="truncate">{t('adminAnalytics.totalTeachers')}</span>
                </div>
                <span className="font-bold tabular-nums shrink-0 ml-2">
                  {stats.users.teachers} ({teacherPct}%)
                </span>
              </div>
              <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-2.5">
                <div
                  className="bg-[var(--teacher-accent)] h-2.5 rounded-full transition-all"
                  style={{ width: `${teacherPct}%` }}
                />
              </div>
            </div>

            {/* Admin Share */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--color-foreground)] mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="w-4 h-4 text-[var(--info)] shrink-0" />
                  <span className="truncate">{t('adminAnalytics.totalAdmins')}</span>
                </div>
                <span className="font-bold tabular-nums shrink-0 ml-2">
                  {stats.users.admins} ({adminPct}%)
                </span>
              </div>
              <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-2.5">
                <div
                  className="bg-[var(--info)] h-2.5 rounded-full transition-all"
                  style={{ width: `${adminPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
