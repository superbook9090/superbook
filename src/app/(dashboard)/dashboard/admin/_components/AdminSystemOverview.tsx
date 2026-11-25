'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  BookOpen,
  HelpCircle,
  Newspaper,
  Notebook,
  BarChart3,
  Sliders,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Database,
  Server,
  Zap,
} from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';

export default function AdminSystemOverview() {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableBlogs = useFeature('enableBlogs');
  const enableNotes = useFeature('enableNotes');
  const enableAnalytics = useFeature('enableAnalytics');

  const modules = [
    { name: t('admin.courseCatalog'), enabled: enableCourses, icon: BookOpen, color: '#a855f7' },
    { name: t('admin.quizBank'), enabled: enableQuizzes, icon: HelpCircle, color: '#3b82f6' },
    { name: t('admin.knowledgeBase'), enabled: enableBlogs, icon: Newspaper, color: '#ec4899' },
    { name: t('common.notes'), enabled: enableNotes, icon: Notebook, color: '#10b981' },
    { name: t('admin.analytics'), enabled: enableAnalytics, icon: BarChart3, color: '#6366f1' },
  ];

  return (
    <section
      aria-labelledby="system-modules-heading"
      className="teacher-panel p-4 sm:p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--border)]/70">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-indigo-500/12 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sliders className="w-4 h-4" />
          </span>
          <h2
            id="system-modules-heading"
            className="text-base sm:text-lg font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)]"
          >
            {t('admin.engineCapabilities')}
          </h2>
        </div>

        <Link
          href={ROUTES.admin.settings}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--teacher-primary)] hover:underline min-h-[36px]"
        >
          <span>{t('admin.configureInSettings')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {modules.map((mod) => (
          <div
            key={mod.name}
            className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)]/70 hover:border-[var(--teacher-primary)]/40 transition-colors flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] shrink-0"
                style={{
                  backgroundColor: `color-mix(in srgb, ${mod.color} 14%, transparent)`,
                  color: mod.color,
                }}
              >
                <mod.icon className="w-4 h-4" />
              </span>
              {mod.enabled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-[var(--color-muted-foreground)] shrink-0" />
              )}
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] truncate">
                {mod.name}
              </p>
              <p
                className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                  mod.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--color-muted-foreground)]'
                }`}
              >
                {mod.enabled ? t('dashboard.active') : t('dashboard.inactive')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3.5 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[var(--color-muted-foreground)]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" />
          <span>MongoDB Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-sky-500" />
          <span>Next.js 15 App Router</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>FCM Notification Gateway</span>
        </div>
      </div>
    </section>
  );
}
