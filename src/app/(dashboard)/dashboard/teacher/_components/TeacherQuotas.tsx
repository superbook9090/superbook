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
      className="card-surface card-body rounded-3xl border border-[var(--border)] space-y-4 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 id="quotas-heading" className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {t('dashboard.resourceQuotas')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            {t('dashboard.resourceQuotasDesc')}
          </p>
        </div>
      </div>

      <div className="perspective-1000">
        <ResponsiveGrid variant="cards">
          {quotaItems.map((item) => {
            const percentage = Math.min(100, Math.round((item.current / item.limit) * 100));
            const isAtLimit = item.current >= item.limit;
            const isNearLimit = percentage >= 80 && !isAtLimit;

            return (
              <div
                key={item.key}
                className="p-4 rounded-2xl antigravity-glass border border-[var(--border)] hover:border-[var(--teacher-primary)]/40 transition-all duration-300 flex flex-col justify-between shadow-sm group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-sm"
                      style={{ backgroundColor: `color-mix(in srgb, ${item.color} 15%, transparent)`, color: item.color }}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-[var(--color-foreground)]">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-[var(--color-foreground)]">
                    {item.current} / {item.limit}
                  </span>
                </div>

                <div className="w-full bg-[var(--surface-muted-strong)] rounded-full h-2 my-2.5 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isAtLimit
                        ? 'var(--error)'
                        : isNearLimit
                        ? 'var(--warning)'
                        : item.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--color-muted-foreground)] font-medium">
                  <span>{percentage}% {t('dashboard.used')}</span>
                  {isAtLimit ? (
                    <span className="inline-flex items-center gap-1 font-bold text-[var(--error)]">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {t('dashboard.atLimit')}
                    </span>
                  ) : isNearLimit ? (
                    <span className="inline-flex items-center gap-1 font-bold text-[var(--warning)]">
                      {t('dashboard.nearLimit')}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </ResponsiveGrid>
      </div>
    </motion.section>
  );
}
