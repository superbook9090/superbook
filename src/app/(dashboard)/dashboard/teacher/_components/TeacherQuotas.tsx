'use client';

import { motion } from 'framer-motion';
import { BookOpen, HelpCircle, BarChart3, ShieldAlert } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
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
            color: 'var(--info)',
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
            color: 'var(--teacher-accent)',
          },
        ]
      : []),
  ];

  if (quotaItems.length === 0) return null;

  return (
    <section aria-labelledby="quotas-heading" className="space-y-3 sm:space-y-4">
      <div>
        <h2
          id="quotas-heading"
          className="text-base sm:text-lg font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)]"
        >
          {t('dashboard.resourceQuotas')}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-0.5">
          {t('dashboard.resourceQuotasDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {quotaItems.map((item, idx) => {
          const percentage = Math.min(100, Math.round((item.current / item.limit) * 100));
          const isAtLimit = item.current >= item.limit;
          const isNearLimit = percentage >= 80 && !isAtLimit;

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx, duration: 0.25 }}
              className="teacher-card p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${item.color} 14%, transparent)`,
                      color: item.color,
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-[var(--color-foreground)] truncate">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-extrabold tabular-nums text-[var(--color-foreground)] shrink-0">
                  {item.current}
                  <span className="text-[var(--color-muted-foreground)] font-medium"> / {item.limit}</span>
                </span>
              </div>

              <div className="w-full bg-[var(--surface-muted-strong)] rounded-full h-1.5 my-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
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

              <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)] font-semibold">
                <span>{percentage}% {t('dashboard.used')}</span>
                {isAtLimit ? (
                  <span className="inline-flex items-center gap-1 text-[var(--error)]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {t('dashboard.atLimit')}
                  </span>
                ) : isNearLimit ? (
                  <span className="text-[var(--warning)]">{t('dashboard.nearLimit')}</span>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
