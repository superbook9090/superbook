'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  BookOpen,
  HelpCircle,
  Newspaper,
  Notebook,
  BarChart3,
  Sliders,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';
import { ResponsiveGrid } from '@/components/layout';

export default function AdminSystemOverview() {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableBlogs = useFeature('enableBlogs');
  const enableNotes = useFeature('enableNotes');
  const enableAnalytics = useFeature('enableAnalytics');

  const modules = [
    {
      name: t('admin.allCourses'),
      enabled: enableCourses,
      icon: BookOpen,
      color: 'var(--teacher-primary)',
    },
    {
      name: t('common.quizzes'),
      enabled: enableQuizzes,
      icon: HelpCircle,
      color: 'var(--student-primary)',
    },
    {
      name: t('common.blogs'),
      enabled: enableBlogs,
      icon: Newspaper,
      color: 'var(--admin-primary, #ec4899)',
    },
    {
      name: t('common.notes'),
      enabled: enableNotes,
      icon: Notebook,
      color: 'var(--warning)',
    },
    {
      name: t('admin.analytics'),
      enabled: enableAnalytics,
      icon: BarChart3,
      color: 'var(--info)',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      aria-labelledby="system-modules-heading"
      className="card-surface card-body rounded-2xl border border-[var(--border)] space-y-3.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[var(--teacher-soft)] text-[var(--teacher-primary)]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 id="system-modules-heading" className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
              {t('dashboard.systemModules')}
            </h2>
          </div>
        </div>
      </div>

      <ResponsiveGrid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {modules.map((mod) => (
          <div
            key={mod.name}
            className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <div
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: `color-mix(in srgb, ${mod.color} 15%, transparent)`, color: mod.color }}
              >
                <mod.icon className="w-4 h-4" />
              </div>
              {mod.enabled ? (
                <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-[var(--color-muted-foreground)] shrink-0" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-[var(--color-foreground)] truncate">{mod.name}</p>
              <p
                className={`text-[11px] font-medium mt-0.5 ${
                  mod.enabled ? 'text-[var(--success)]' : 'text-[var(--color-muted-foreground)]'
                }`}
              >
                {mod.enabled ? t('dashboard.active') : t('dashboard.inactive')}
              </p>
            </div>
          </div>
        ))}
      </ResponsiveGrid>
    </motion.section>
  );
}
