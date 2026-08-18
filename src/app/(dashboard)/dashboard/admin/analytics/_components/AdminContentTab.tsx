'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Radio, Users, CheckCircle2, ArrowUpRight, BookMarked, FileText } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import StatCard from '@/components/ui/StatCard';
import type { AdminStats } from './types';

interface AdminContentTabProps {
  stats: AdminStats;
}

export function AdminContentTab({ stats }: AdminContentTabProps) {
  const { t } = useTranslation();

  const topCourses = stats.topCourses || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 sm:space-y-6 w-full min-w-0"
    >
      {/* Content Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 w-full min-w-0">
        <StatCard
          icon={BookOpen}
          value={stats.courses.total}
          label={t('adminAnalytics.totalCourses')}
          color="info"
          delay={0.05}
        />
        <StatCard
          icon={Radio}
          value={stats.courses.published}
          label={t('adminAnalytics.liveCourses')}
          color="success"
          delay={0.1}
        />
        <StatCard
          icon={Users}
          value={stats.enrollments.total}
          label={t('adminAnalytics.totalEnrollments')}
          color="student"
          delay={0.15}
        />
        <StatCard
          icon={BookMarked}
          value={stats.enrollments.active}
          label={t('adminAnalytics.activeEnrollments')}
          color="warning"
          delay={0.2}
        />
        <StatCard
          icon={CheckCircle2}
          value={stats.enrollments.completed}
          label={t('adminAnalytics.completedEnrollments')}
          color="success"
          delay={0.25}
        />
        {stats.blogs !== undefined && (
          <StatCard
            icon={FileText}
            value={stats.blogs.total}
            label={t('adminAnalytics.totalBlogs')}
            color="info"
            delay={0.3}
            description={`${stats.blogs.published} ${t('adminAnalytics.published')}`}
          />
        )}
      </div>

      {/* Top Enrolled Courses Table */}
      <div className="card-panel w-full min-w-0 overflow-hidden">
        <div className="card-panel-header flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.topCoursesTitle')}
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
              {t('adminAnalytics.topCoursesSubtitle')}
            </p>
          </div>
          <Link
            href={ROUTES.admin.courses}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto shrink-0"
          >
            <span>{t('adminAnalytics.manageCourses')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {topCourses.length === 0 ? (
          <div className="card-panel-body text-center py-10">
            <BookOpen className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
            <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm">{t('adminAnalytics.noTopCourses')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-0">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[var(--color-surface-muted)]">
                <tr>
                  <th className="px-3.5 sm:px-6 py-2.5 sm:py-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('adminAnalytics.courseTitle')}
                  </th>
                  <th className="px-3.5 sm:px-6 py-2.5 sm:py-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider hidden sm:table-cell">
                    {t('adminAnalytics.category')}
                  </th>
                  <th className="px-3.5 sm:px-6 py-2.5 sm:py-3 text-center text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('adminAnalytics.status')}
                  </th>
                  <th className="px-3.5 sm:px-6 py-2.5 sm:py-3 text-right text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('adminAnalytics.enrolledStudents')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {topCourses.map((course, idx) => (
                  <tr key={course._id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                    <td className="px-3.5 sm:px-6 py-3 sm:py-3.5 max-w-[180px] sm:max-w-none">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
                          {course.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 sm:px-6 py-3 sm:py-3.5 text-xs text-[var(--color-muted-foreground)] hidden sm:table-cell">
                      {course.category}
                    </td>
                    <td className="px-3.5 sm:px-6 py-3 sm:py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                          course.isPublished
                            ? 'bg-[var(--success-light)] text-[var(--success)]'
                            : 'bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]'
                        }`}
                      >
                        {course.isPublished ? t('adminAnalytics.published') : t('adminAnalytics.draft')}
                      </span>
                    </td>
                    <td className="px-3.5 sm:px-6 py-3 sm:py-3.5 text-right font-bold tabular-nums text-xs sm:text-sm text-[var(--color-foreground)]">
                      {course.studentsCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
