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
      className="card-surface card-body rounded-2xl border border-[var(--border)] space-y-4"
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

      <ResponsiveGrid variant="cards">
        {quotaItems.map((item) => {
          const percentage = Math.min(100, Math.round((item.current / item.limit) * 100));
          const isAtLimit = item.current >= item.limit;
          const isNearLimit = percentage >= 80 && !isAtLimit;

          return (
            <div
              key={item.key}
              className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: `color-mix(in srgb, ${item.color} 15%, transparent)`, color: item.color }}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                    {item.label}
                  </span>
                </div>
                <span className="text-xs font-bold tabular-nums text-[var(--color-foreground)]">
                  {item.current} / {item.limit}
                </span>
              </div>

              <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-2 my-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500"
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

              <div className="flex items-center justify-between text-[11px] text-[var(--color-muted-foreground)]">
                <span>{percentage}% {t('dashboard.used')}</span>
                {isAtLimit ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--error)]">
                    <ShieldAlert className="w-3 h-3" />
                    {t('dashboard.atLimit')}
                  </span>
                ) : isNearLimit ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--warning)]">
                    {t('dashboard.nearLimit')}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </ResponsiveGrid>
    </motion.section>
  );
}
