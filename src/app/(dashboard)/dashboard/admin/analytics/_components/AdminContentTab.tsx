'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  BookOpen,
  Radio,
  Users,
  CheckCircle2,
  ArrowUpRight,
  BookMarked,
  FileText,
  Award,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import StatCard from '@/components/ui/StatCard';
import { EmptyState } from '@/components/layout';
import type { AdminStats } from './types';

const AdminCategoryBreakdownChart = dynamic(
  () => import('./AdminCategoryBreakdownChart').then((m) => m.AdminCategoryBreakdownChart),
  { ssr: false, loading: () => <div className="h-[340px] teacher-panel animate-pulse" /> }
);

interface AdminContentTabProps {
  stats: AdminStats;
}

export function AdminContentTab({ stats }: AdminContentTabProps) {
  const { t } = useTranslation();

  const topCourses = stats.topCourses || [];
  const maxStudents = Math.max(...topCourses.map((c) => c.studentsCount || 1), 1);

  return (
    <div className="space-y-4 sm:space-y-5 w-full min-w-0">
      {/* Content KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
        <StatCard
          icon={BookOpen}
          value={stats.courses.total}
          label={t('adminAnalytics.totalCourses')}
          color="teacher"
          delay={0.04}
        />
        <StatCard
          icon={Radio}
          value={stats.courses.published}
          label={t('adminAnalytics.liveCourses')}
          color="success"
          delay={0.08}
        />
        <StatCard
          icon={Users}
          value={stats.enrollments.total}
          label={t('adminAnalytics.totalEnrollments')}
          color="info"
          delay={0.12}
        />
        <StatCard
          icon={BookMarked}
          value={stats.enrollments.active}
          label={t('adminAnalytics.activeEnrollments')}
          color="warning"
          delay={0.16}
        />
        <StatCard
          icon={CheckCircle2}
          value={stats.enrollments.completed}
          label={t('adminAnalytics.completedEnrollments')}
          color="success"
          delay={0.2}
        />
        {stats.blogs !== undefined && (
          <StatCard
            icon={FileText}
            value={stats.blogs.total}
            label={t('adminAnalytics.totalBlogs')}
            color="student"
            delay={0.24}
            description={`${stats.blogs.published} ${t('adminAnalytics.published')}`}
          />
        )}
      </div>

      {/* Category Demand Breakdown Chart */}
      <AdminCategoryBreakdownChart data={stats.categoryBreakdown} />

      {/* Top Enrolled Courses Leaderboard */}
      <div className="teacher-panel overflow-hidden w-full min-w-0">
        <div className="p-4 sm:p-5 border-b border-[var(--border)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
              <Award className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
                {t('adminAnalytics.topCoursesTitle')}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 line-clamp-1">
                {t('adminAnalytics.topCoursesSubtitle')}
              </p>
            </div>
          </div>

          <Link
            href={ROUTES.admin.courses}
            className="teacher-cta-btn min-h-[40px] px-3.5 text-xs shrink-0 self-start sm:self-auto"
          >
            <span>{t('adminAnalytics.manageCourses')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {topCourses.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={BookOpen}
              title={t('adminAnalytics.noTopCourses')}
              description={t('adminAnalytics.topCoursesSubtitle')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-0">
            <table className="min-w-full divide-y divide-[var(--border)]/70">
              <thead className="bg-[var(--surface-muted)]/75">
                <tr>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('adminAnalytics.courseTitle')}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider hidden sm:table-cell">
                    {t('adminAnalytics.category')}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-center text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('adminAnalytics.status')}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-right text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider w-44">
                    {t('adminAnalytics.enrolledStudents')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/70">
                {topCourses.map((course, idx) => {
                  const pct = Math.round(((course.studentsCount || 0) / maxStudents) * 100);
                  const rankTone =
                    idx === 0
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/35'
                      : idx === 1
                      ? 'bg-[var(--surface-muted-strong)] text-[var(--color-foreground)] border-[var(--border)]'
                      : idx === 2
                      ? 'bg-orange-500/12 text-orange-700 dark:text-orange-400 border-orange-500/30'
                      : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border-transparent';

                  return (
                    <tr
                      key={course._id}
                      className="hover:bg-[var(--surface-muted)]/45 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3.5 max-w-[220px] sm:max-w-none">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-[8px] border font-bold text-xs flex items-center justify-center shrink-0 tabular-nums ${rankTone}`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] truncate">
                            {course.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 text-xs font-medium text-[var(--color-muted-foreground)] hidden sm:table-cell">
                        {course.category || '—'}
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            course.isPublished
                              ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                              : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)]'
                          }`}
                        >
                          {course.isPublished ? t('adminAnalytics.published') : t('adminAnalytics.draft')}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="font-extrabold tabular-nums text-xs sm:text-sm text-[var(--color-foreground)]">
                            {course.studentsCount.toLocaleString()}
                          </span>
                          <div className="w-24 sm:w-28 bg-[var(--surface-muted-strong)] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: 'var(--teacher-gradient)' }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
