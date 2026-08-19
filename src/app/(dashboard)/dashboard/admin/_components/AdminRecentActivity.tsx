'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { BookOpen, Users, Activity, ArrowRight, Award } from 'lucide-react';
import type { AdminStats } from './types';

interface AdminRecentActivityProps {
  stats: AdminStats | null;
}

export default function AdminRecentActivity({ stats }: AdminRecentActivityProps) {
  const { t } = useTranslation();
  const topCourses = stats?.topCourses || [];
  const recentActivity = stats?.recentActivity || [];

  if (topCourses.length === 0 && recentActivity.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
    >
      {/* Top Courses */}
      {topCourses.length > 0 && (
        <div className="card-surface rounded-2xl border border-[var(--border)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[var(--teacher-soft)] text-[var(--teacher-primary)]">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--color-foreground)]">
                  {t('dashboard.topCourses')}
                </h3>
              </div>
              <Link
                href={ROUTES.admin.courses}
                className="text-xs font-semibold text-[var(--teacher-primary)] hover:underline flex items-center gap-1"
              >
                <span>{t('dashboard.viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {topCourses.slice(0, 4).map((course, idx) => (
                <div
                  key={course._id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[var(--teacher-soft)] text-[var(--teacher-primary)] text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
                      {course.title}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-muted-foreground)] shrink-0 ml-2">
                    <Users className="w-3.5 h-3.5" />
                    {course.studentsCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Platform Activity */}
      {recentActivity.length > 0 && (
        <div className="card-surface rounded-2xl border border-[var(--border)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[var(--info-light)] text-[var(--info)]">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--color-foreground)]">
                  {t('dashboard.platformActivity')}
                </h3>
              </div>
              <Link
                href={ROUTES.admin.analytics}
                className="text-xs font-semibold text-[var(--info)] hover:underline flex items-center gap-1"
              >
                <span>{t('admin.analytics')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentActivity.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-[var(--card-solid)] text-[var(--color-foreground)] shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--info)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
                        {item.user}
                      </p>
                      <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                        {item.item}
                      </p>
                    </div>
                  </div>
                  {item.date && (
                    <span className="text-[11px] text-[var(--color-muted-foreground)] shrink-0 ml-2">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
