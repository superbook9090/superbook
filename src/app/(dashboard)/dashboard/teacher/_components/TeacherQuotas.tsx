'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { BookOpen, HelpCircle, BarChart3, ShieldAlert } from 'lucide-react';
import { ResponsiveGrid } from '@/components/layout';
import { useFeature } from '@/contexts/AppSettingsContext';
import type { TeacherStatsData } from './types';

interface TeacherQuotasProps {
  stats: TeacherStatsData;
  courseLimit: number;
  quizLimit: number;
  blogLimit: number;
}

export default function TeacherQuotas({
  stats,
  courseLimit,
  quizLimit,
  blogLimit,
}: TeacherQuotasProps) {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableBlogs = useFeature('enableBlogs');

  const quotaItems = [
    ...(enableCourses
      ? [
          {
            key: 'courses',
            label: t('dashboard.myCourses'),
            icon: BookOpen,
            current: stats.totalCourses,
            limit: courseLimit,
            color: 'var(--teacher-primary)',
          },
        ]
      : []),
    ...(enableQuizzes
      ? [
          {
            key: 'quizzes',
            label: t('dashboard.myQuizzes'),
            icon: HelpCircle,
            current: stats.totalQuizzes,
            limit: quizLimit,
            color: 'var(--student-primary)',
          },
        ]
      : []),
    ...(enableBlogs
      ? [
          {
            key: 'blogs',
            label: t('dashboard.myBlogs'),
            icon: BarChart3,
            current: stats.totalBlogs,
            limit: blogLimit,
            color: 'var(--admin-primary, #ec4899)',
          },
        ]
      : []),
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      aria-labelledby="quotas-heading"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 id="quotas-heading" className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
            {t('dashboard.resourceQuotas')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-1 font-medium">
            {t('dashboard.resourceQuotasDesc')}
          </p>
        </div>
      </div>

      <div className="perspective-1000">
        <ResponsiveGrid variant="cards">
          {quotaItems.map((item, idx) => {
            const percentage = Math.min(100, Math.round((item.current / item.limit) * 100));
            const isAtLimit = item.current >= item.limit;
            const isNearLimit = percentage >= 80 && !isAtLimit;

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 16, rotateX: 6 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.4 + idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="relative overflow-hidden p-5 rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-xl border border-[var(--border)]/50 hover:border-[var(--teacher-primary)]/50 transition-all duration-500 shadow-xl group"
              >
                {/* Glow effect on hover */}
                <div 
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: item.color }}
                />

                <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm border border-white/5"
                      style={{ backgroundColor: `color-mix(in srgb, ${item.color} 15%, transparent)`, color: item.color }}
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-sm sm:text-base text-[var(--color-foreground)] tracking-tight">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold tabular-nums text-[var(--color-foreground)]">
                    {item.current} <span className="text-[var(--color-muted)] font-medium">/ {item.limit}</span>
                  </span>
                </div>

                <div className="relative z-10 w-full bg-[var(--surface-muted-strong)] rounded-full h-1.5 my-4 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + idx * 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: isAtLimit
                        ? 'var(--error)'
                        : isNearLimit
                        ? 'var(--warning)'
                        : item.color,
                    }}
                  />
                </div>

                <div className="relative z-10 flex items-center justify-between text-[11px] sm:text-xs text-[var(--color-muted-foreground)] font-bold">
                  <span>{percentage}% {t('dashboard.used')}</span>
                  {isAtLimit ? (
                    <span className="inline-flex items-center gap-1.5 text-[var(--error)]">
                      <ShieldAlert className="w-4 h-4" />
                      {t('dashboard.atLimit')}
                    </span>
                  ) : isNearLimit ? (
                    <span className="inline-flex items-center gap-1.5 text-[var(--warning)]">
                      {t('dashboard.nearLimit')}
                    </span>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </ResponsiveGrid>
      </div>
    </motion.section>
  );
}
