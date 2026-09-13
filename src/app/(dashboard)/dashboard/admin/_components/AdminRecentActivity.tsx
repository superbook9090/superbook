'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  Users,
  Activity,
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
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

  const maxStudents = Math.max(...topCourses.map((c) => c.studentsCount || 1), 1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35 }}
      aria-labelledby="platform-radar-heading"
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
    >
      {/* Top Courses Leaderboard */}
      {topCourses.length > 0 && (
        <div className="antigravity-glass rounded-3xl border border-[var(--border)] p-5 sm:p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500 border border-purple-500/25 shadow-xs">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="platform-radar-heading" className="font-extrabold text-sm sm:text-base text-[var(--color-foreground)]">
                    {t('admin.topCurriculumLeaders') || 'Top Performing Courses'}
                  </h3>
                </div>
              </div>
              <Link
                href={ROUTES.admin.courses}
                className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 min-h-[36px]"
              >
                <span>{t('dashboard.viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {topCourses.slice(0, 4).map((course, idx) => {
                const percent = Math.round(((course.studentsCount || 0) / maxStudents) * 100);
                const rankColor =
                  idx === 0
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/35 font-black'
                    : idx === 1
                    ? 'bg-slate-400/20 text-slate-300 border-slate-400/35 font-black'
                    : idx === 2
                    ? 'bg-amber-700/20 text-amber-600 border-amber-700/35 font-black'
                    : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)]';

                return (
                  <div
                    key={course._id || idx}
                    className="p-3.5 rounded-2xl antigravity-glass border border-[var(--border)] hover:border-purple-500/40 transition-all duration-300 space-y-2 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center shrink-0 border ${rankColor}`}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors truncate block">
                            {course.title}
                          </span>
                          {course.category && (
                            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                              {course.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-foreground)] shrink-0 ml-2 bg-[var(--surface-muted)] px-2.5 py-1 rounded-xl">
                        <Users className="w-3.5 h-3.5 text-purple-500" />
                        {course.studentsCount}
                      </span>
                    </div>

                    <div className="w-full bg-[var(--surface-muted-strong)] h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Live Platform Activity Radar */}
      {recentActivity.length > 0 && (
        <div className="antigravity-glass rounded-3xl border border-[var(--border)] p-5 sm:p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-500 border border-sky-500/25 shadow-xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[var(--color-foreground)]">
                    {t('admin.recentPlatformAudits') || 'Live Platform Activity Feed'}
                  </h3>
                </div>
              </div>
              <Link
                href={ROUTES.admin.analytics}
                className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-1 min-h-[36px]"
              >
                <span>{t('admin.viewFullRadar') || 'Analytics'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentActivity.slice(0, 4).map((item, idx) => {
                const isEnrollment = item.type === 'enrollment';

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl antigravity-glass border border-[var(--border)] hover:border-sky-500/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isEnrollment ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {isEnrollment ? <CheckCircle className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs sm:text-sm font-extrabold text-[var(--color-foreground)] truncate">
                            {item.user}
                          </p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isEnrollment ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {isEnrollment ? 'Enrollment' : 'Quiz'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                          {item.item}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 ml-2">
                      {typeof item.score === 'number' && (
                        <span className="text-[11px] font-extrabold text-amber-500">
                          {item.score}%
                        </span>
                      )}
                      {item.date && (
                        <span className="text-[10px] text-[var(--color-muted-foreground)] font-medium flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
