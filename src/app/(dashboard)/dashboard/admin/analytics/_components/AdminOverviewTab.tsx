'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  CheckCircle2,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import StatCard from '@/components/ui/StatCard';
import { AdminActivityChart } from './AdminActivityChart';
import { AdminRoleDistributionChart } from './AdminRoleDistributionChart';
import type { AdminStats } from './types';

interface AdminOverviewTabProps {
  stats: AdminStats;
}

export function AdminOverviewTab({ stats }: AdminOverviewTabProps) {
  const { t } = useTranslation();

  const completionRate =
    stats.enrollments.total > 0
      ? Math.round((stats.enrollments.completed / stats.enrollments.total) * 100)
      : 0;

  const quickLinks = [
    {
      href: ROUTES.admin.users,
      label: t('adminAnalytics.manageUsers'),
      icon: Users,
      color: 'text-[var(--info)] bg-[var(--info-light)]',
    },
    {
      href: ROUTES.admin.courses,
      label: t('adminAnalytics.manageCourses'),
      icon: BookOpen,
      color: 'text-[var(--success)] bg-[var(--success-light)]',
    },
    {
      href: ROUTES.admin.quizzes,
      label: t('adminAnalytics.manageQuizzes'),
      icon: Award,
      color: 'text-[var(--primary)] bg-[var(--primary-soft)]',
    },
    {
      href: ROUTES.admin.settings,
      label: t('adminAnalytics.manageSettings'),
      icon: Settings,
      color: 'text-[var(--warning)] bg-[var(--warning-light)]',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 sm:space-y-6 w-full min-w-0"
    >
      {/* Top 6 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 w-full min-w-0">
        <StatCard
          icon={Users}
          value={stats.users.total}
          label={t('adminAnalytics.totalUsers')}
          color="info"
          delay={0.05}
          description={
            stats.users.newThisMonth > 0
              ? `+${stats.users.newThisMonth} ${t('adminAnalytics.newThisMonth')}`
              : undefined
          }
        />
        <StatCard
          icon={BookOpen}
          value={stats.courses.total}
          label={t('adminAnalytics.totalCourses')}
          color="success"
          delay={0.1}
          description={`${stats.courses.published} ${t('adminAnalytics.published')}`}
        />
        <StatCard
          icon={Users}
          value={stats.enrollments.total}
          label={t('adminAnalytics.totalEnrollments')}
          color="student"
          delay={0.15}
          description={`${stats.enrollments.active} ${t('adminAnalytics.activeEnrollments')}`}
        />
        <StatCard
          icon={Award}
          value={stats.quizzes.totalAttempts}
          label={t('adminAnalytics.totalAttempts')}
          color="warning"
          delay={0.2}
          description={`${stats.quizzes.total} ${t('adminAnalytics.totalQuizzes')}`}
        />
        <StatCard
          icon={TrendingUp}
          value={stats.quizzes.averageScore}
          suffix="%"
          label={t('adminAnalytics.averageScore')}
          color="student"
          delay={0.25}
          showProgress={true}
          progress={stats.quizzes.averageScore}
        />
        <StatCard
          icon={CheckCircle2}
          value={completionRate}
          suffix="%"
          label={t('adminAnalytics.completionRate')}
          color="success"
          delay={0.3}
          showProgress={true}
          progress={completionRate}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
        <div className="lg:col-span-2 w-full min-w-0">
          <AdminActivityChart data={stats.trends || []} />
        </div>
        <div className="lg:col-span-1 w-full min-w-0">
          <AdminRoleDistributionChart users={stats.users} />
        </div>
      </div>

      {/* Highlights & Quick Links Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
        {/* Content Pipeline Card */}
        <div className="card-panel w-full min-w-0">
          <div className="card-panel-header">
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] flex items-center gap-2 truncate">
              <BookOpen className="w-4 h-4 text-[var(--success)] shrink-0" />
              <span>{t('adminAnalytics.contentPipeline')}</span>
            </h3>
          </div>
          <div className="card-panel-body space-y-3.5 sm:space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-[var(--color-foreground)] mb-1">
                <span className="truncate mr-2">{t('adminAnalytics.totalCourses')}</span>
                <span className="shrink-0">{stats.courses.published} / {stats.courses.total} {t('adminAnalytics.published')}</span>
              </div>
              <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-2">
                <div
                  className="bg-[var(--success)] h-2 rounded-full transition-all"
                  style={{
                    width: `${stats.courses.total > 0 ? (stats.courses.published / stats.courses.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[var(--color-foreground)] mb-1">
                <span className="truncate mr-2">{t('adminAnalytics.totalQuizzes')}</span>
                <span className="shrink-0">{stats.quizzes.published} / {stats.quizzes.total} {t('adminAnalytics.published')}</span>
              </div>
              <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-2">
                <div
                  className="bg-[var(--primary)] h-2 rounded-full transition-all"
                  style={{
                    width: `${stats.quizzes.total > 0 ? (stats.quizzes.published / stats.quizzes.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {stats.blogs !== undefined && stats.blogs.total > 0 && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-[var(--color-foreground)] mb-1">
                  <span className="truncate mr-2">{t('adminAnalytics.totalBlogs')}</span>
                  <span className="shrink-0">{stats.blogs.published} / {stats.blogs.total} {t('adminAnalytics.published')}</span>
                </div>
                <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-2">
                  <div
                    className="bg-[var(--info)] h-2 rounded-full transition-all"
                    style={{
                      width: `${(stats.blogs.published / stats.blogs.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Learning Health Benchmarks */}
        <div className="card-panel w-full min-w-0">
          <div className="card-panel-header">
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 text-[var(--warning)] shrink-0" />
              <span>{t('adminAnalytics.learningHealth')}</span>
            </h3>
          </div>
          <div className="card-panel-body space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-muted-foreground)] truncate">{t('adminAnalytics.averageScore')}</p>
                <p className="text-lg sm:text-xl font-bold tabular-nums text-[var(--color-foreground)] mt-0.5">{stats.quizzes.averageScore}%</p>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-[var(--student-soft)] text-[var(--student-primary)] shrink-0 text-right">
                {stats.quizzes.averageScore >= 70 ? t('adminAnalytics.highPerformers') : t('adminAnalytics.averagePerformers')}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-muted-foreground)] truncate">{t('adminAnalytics.completionRate')}</p>
                <p className="text-lg sm:text-xl font-bold tabular-nums text-[var(--color-foreground)] mt-0.5">{completionRate}%</p>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-[var(--success-light)] text-[var(--success)] shrink-0">
                {stats.enrollments.completed} / {stats.enrollments.total}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="card-panel w-full min-w-0 md:col-span-2 lg:col-span-1">
          <div className="card-panel-header">
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
              {t('adminAnalytics.quickLinks')}
            </h3>
          </div>
          <div className="card-panel-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] transition-all group cursor-pointer min-w-0"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${link.color} shrink-0`}>
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                      {link.label}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
