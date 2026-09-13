'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
    {
      name: t('admin.courseCatalog') || 'Courses Engine',
      enabled: enableCourses,
      icon: BookOpen,
      color: '#a855f7',
    },
    {
      name: t('admin.quizBank') || 'Quiz Engine',
      enabled: enableQuizzes,
      icon: HelpCircle,
      color: '#3b82f6',
    },
    {
      name: t('admin.knowledgeBase') || 'Blog Engine',
      enabled: enableBlogs,
      icon: Newspaper,
      color: '#ec4899',
    },
    {
      name: t('common.notes'),
      enabled: enableNotes,
      icon: Notebook,
      color: '#10b981',
    },
    {
      name: t('admin.analytics'),
      enabled: enableAnalytics,
      icon: BarChart3,
      color: '#6366f1',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.35 }}
      aria-labelledby="system-modules-heading"
      className="antigravity-glass rounded-3xl border border-[var(--border)] p-5 sm:p-6 space-y-4 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500 border border-purple-500/25 shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 id="system-modules-heading" className="text-base sm:text-lg font-black tracking-tight text-[var(--color-foreground)]">
              {t('admin.engineCapabilities') || 'Platform Engines & Features'}
            </h2>
          </div>
        </div>

        <Link
          href={ROUTES.admin.settings}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:underline min-h-[36px]"
        >
          <span>{t('admin.configureInSettings') || 'Configure in Settings'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {modules.map((mod) => (
          <div
            key={mod.name}
            className="p-3.5 rounded-2xl antigravity-glass border border-[var(--border)] hover:border-[var(--primary)]/40 transition-all duration-300 flex flex-col justify-between shadow-xs group"
          >
            <div className="flex items-center justify-between gap-1.5 mb-2.5">
              <div
                className="p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-xs"
                style={{ backgroundColor: `color-mix(in srgb, ${mod.color} 15%, transparent)`, color: mod.color }}
              >
                <mod.icon className="w-4 h-4" />
              </div>
              {mod.enabled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-[var(--color-muted-foreground)] shrink-0" />
              )}
            </div>

            <div>
              <p className="text-xs font-extrabold text-[var(--color-foreground)] truncate">{mod.name}</p>
              <p
                className={`text-[11px] font-bold mt-0.5 ${
                  mod.enabled ? 'text-emerald-500' : 'text-[var(--color-muted-foreground)]'
                }`}
              >
                {mod.enabled ? (t('dashboard.active') || 'Active') : (t('dashboard.inactive') || 'Disabled')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Infrastructure Bar */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--color-muted-foreground)]">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>MongoDB Engine</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-sky-500" />
          <span>Next.js 15 App Router</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>FCM Notification Gateway</span>
        </div>
      </div>
    </motion.section>
  );
}
