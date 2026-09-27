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
      transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
      aria-labelledby="platform-radar-heading"
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
    >
      {/* Top Courses Leaderboard */}
      {topCourses.length > 0 && (
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)]/50 bg-[var(--card-solid)]/40 backdrop-blur-2xl p-6 flex flex-col justify-between shadow-xl group/card">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none group-hover/card:bg-purple-500/20 transition-colors duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border)]/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-500 border border-purple-500/30 shadow-sm">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="platform-radar-heading" className="font-extrabold text-lg text-[var(--color-foreground)] tracking-tight">
                    {t('admin.topCurriculumLeaders')}
                  </h3>
                </div>
              </div>
              <Link
                href={ROUTES.admin.courses}
                className="text-xs font-bold text-[var(--primary)] hover:text-purple-400 flex items-center gap-1.5 min-h-[36px] group/link transition-colors"
              >
                <span>{t('dashboard.viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-3">
              {topCourses.slice(0, 4).map((course, idx) => {
                const percent = Math.round(((course.studentsCount || 0) / maxStudents) * 100);
                const rankColor =
                  idx === 0
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : idx === 1
                    ? 'bg-slate-400/20 text-slate-300 border-slate-400/40'
                    : idx === 2
                    ? 'bg-amber-700/20 text-amber-600 border-amber-700/40'
                    : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border-transparent';

                return (
                  <div
                    key={course._id || idx}
                    className="relative p-4 rounded-2xl bg-[var(--card-solid)]/60 backdrop-blur-md border border-[var(--border)]/50 hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 space-y-3 group overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-8 h-8 rounded-[10px] text-xs font-black flex items-center justify-center shrink-0 border ${rankColor}`}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-sm font-extrabold text-[var(--color-foreground)] group-hover:text-purple-400 transition-colors truncate block">
                            {course.title}
                          </span>
                          {course.category && (
                            <span className="text-[10px] font-black text-[var(--color-muted-foreground)] uppercase tracking-widest mt-0.5 block">
                              {course.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-foreground)] shrink-0 bg-[var(--surface-muted-strong)] px-3 py-1.5 rounded-xl border border-[var(--border)]/50">
                        <Users className="w-4 h-4 text-purple-500" />
                        {course.studentsCount}
                      </span>
                    </div>

                    <div className="w-full bg-[var(--surface-muted-strong)] h-1.5 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
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
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)]/50 bg-[var(--card-solid)]/40 backdrop-blur-2xl p-6 flex flex-col justify-between shadow-xl group/card">
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-[40px] pointer-events-none group-hover/card:bg-sky-500/20 transition-colors duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border)]/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-500 border border-sky-500/30 shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[var(--color-foreground)] tracking-tight">
                    {t('admin.recentPlatformAudits')}
                  </h3>
                </div>
              </div>
              <Link
                href={ROUTES.admin.analytics}
                className="text-xs font-bold text-sky-500 hover:text-sky-400 flex items-center gap-1.5 min-h-[36px] group/link transition-colors"
              >
                <span>{t('admin.viewFullRadar')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivity.slice(0, 4).map((item, idx) => {
                const isEnrollment = item.type === 'enrollment';

                return (
                  <div
                    key={idx}
                    className="relative flex items-center justify-between p-4 rounded-2xl bg-[var(--card-solid)]/60 backdrop-blur-md border border-[var(--border)]/50 hover:border-sky-500/50 hover:shadow-lg transition-all duration-300 group overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isEnrollment ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-2xl shrink-0 border ${
                        isEnrollment 
                          ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                      }`}>
                        {isEnrollment ? <CheckCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-extrabold text-[var(--color-foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                            {item.user}
                          </p>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                            isEnrollment 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}>
                            {isEnrollment ? 'Enrollment' : 'Quiz'}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[var(--color-muted-foreground)] truncate">
                          {item.item}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 ml-3">
                      {typeof item.score === 'number' && (
                        <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {item.score}%
                        </span>
                      )}
                      {item.date && (
                        <span className={`text-[10px] font-bold text-[var(--color-muted-foreground)] flex items-center gap-1 ${typeof item.score === 'number' ? 'mt-1' : ''}`}>
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
    </motion.section>
  );
}
