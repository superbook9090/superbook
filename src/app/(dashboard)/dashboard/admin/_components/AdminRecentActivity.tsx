'use client';

import Link from 'next/link';
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
    <section
      aria-labelledby="platform-radar-heading"
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5"
    >
      {/* Top Courses Leaderboard */}
      {topCourses.length > 0 && (
        <div className="teacher-panel p-4 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[var(--border)]/70">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
                  <Award className="w-4 h-4" />
                </span>
                <h3
                  id="platform-radar-heading"
                  className="font-extrabold font-[family-name:var(--font-display)] text-base sm:text-lg text-[var(--color-foreground)] truncate"
                >
                  {t('admin.topCurriculumLeaders')}
                </h3>
              </div>
              <Link
                href={ROUTES.admin.courses}
                className="text-xs font-bold text-[var(--teacher-primary)] hover:underline inline-flex items-center gap-1 min-h-[36px] shrink-0"
              >
                <span>{t('dashboard.viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {topCourses.slice(0, 4).map((course, idx) => {
                const percent = Math.round(((course.studentsCount || 0) / maxStudents) * 100);
                const rankTone =
                  idx === 0
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/35'
                    : idx === 1
                    ? 'bg-[var(--surface-muted-strong)] text-[var(--color-foreground)] border-[var(--border)]'
                    : idx === 2
                    ? 'bg-orange-500/12 text-orange-700 dark:text-orange-400 border-orange-500/30'
                    : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border-transparent';

                return (
                  <div
                    key={course._id || idx}
                    className="p-3.5 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]/70 hover:border-[var(--teacher-primary)]/40 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-[8px] text-xs font-bold flex items-center justify-center shrink-0 border tabular-nums ${rankTone}`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-[var(--color-foreground)] truncate block">
                            {course.title}
                          </span>
                          {course.category && (
                            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider block">
                              {course.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-foreground)] shrink-0 bg-[var(--card-solid)] px-2.5 py-1 rounded-[8px] border border-[var(--border)] tabular-nums">
                        <Users className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
                        {course.studentsCount}
                      </span>
                    </div>

                    <div className="w-full bg-[var(--surface-muted-strong)] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, background: 'var(--teacher-gradient)' }}
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
        <div className="teacher-panel p-4 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[var(--border)]/70">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-sky-500/12 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold font-[family-name:var(--font-display)] text-base sm:text-lg text-[var(--color-foreground)] truncate">
                  {t('admin.recentPlatformAudits')}
                </h3>
              </div>
              <Link
                href={ROUTES.admin.analytics}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 min-h-[36px] shrink-0"
              >
                <span>{t('admin.viewFullRadar')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentActivity.slice(0, 4).map((item, idx) => {
                const isEnrollment = item.type === 'enrollment';

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]/70 hover:border-sky-500/35 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] shrink-0 border ${
                          isEnrollment
                            ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {isEnrollment ? <CheckCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-bold text-[var(--color-foreground)] truncate">
                            {item.user}
                          </p>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                              isEnrollment
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {isEnrollment ? 'Enrollment' : 'Quiz'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                          {item.item}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 tabular-nums">
                      {typeof item.score === 'number' && (
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/12 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {item.score}%
                        </span>
                      )}
                      {item.date && (
                        <span
                          className={`text-[11px] font-medium text-[var(--color-muted-foreground)] inline-flex items-center gap-1 ${
                            typeof item.score === 'number' ? 'mt-1' : ''
                          }`}
                        >
                          <Clock className="w-3 h-3" />
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
    </section>
  );
}
