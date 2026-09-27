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
      name: t('admin.courseCatalog'),
      enabled: enableCourses,
      icon: BookOpen,
      color: '#a855f7',
    },
    {
      name: t('admin.quizBank'),
      enabled: enableQuizzes,
      icon: HelpCircle,
      color: '#3b82f6',
    },
    {
      name: t('admin.knowledgeBase'),
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
      transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
      aria-labelledby="system-modules-heading"
      className="relative overflow-hidden rounded-[2rem] border border-[var(--border)]/50 bg-[var(--card-solid)]/40 backdrop-blur-2xl p-6 shadow-xl"
    >
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--border)]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="system-modules-heading" className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--color-foreground)]">
                {t('admin.engineCapabilities')}
              </h2>
            </div>
          </div>

          <Link
            href={ROUTES.admin.settings}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:text-indigo-400 min-h-[36px] group/link transition-colors"
          >
            <span>{t('admin.configureInSettings')}</span>
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className="relative p-4 rounded-2xl bg-[var(--card-solid)]/60 backdrop-blur-md border border-[var(--border)]/50 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group overflow-hidden"
            >
              {/* Subtle hover glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none blur-md"
                style={{ backgroundColor: mod.color }}
              />

              <div className="relative z-10 flex items-center justify-between gap-1.5 mb-4">
                <div
                  className="p-3 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm border border-white/5"
                  style={{ backgroundColor: `color-mix(in srgb, ${mod.color} 15%, transparent)`, color: mod.color }}
                >
                  <mod.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {mod.enabled ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 drop-shadow-sm" />
                ) : (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-muted-foreground)] shrink-0" />
                )}
              </div>

              <div className="relative z-10">
                <p className="text-xs sm:text-sm font-extrabold text-[var(--color-foreground)] truncate">{mod.name}</p>
                <p
                  className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mt-1 ${
                    mod.enabled ? 'text-emerald-500' : 'text-[var(--color-muted-foreground)]'
                  }`}
                >
                  {mod.enabled ? (t('dashboard.active')) : (t('dashboard.inactive'))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Infrastructure Bar */}
        <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-[var(--color-muted-foreground)] border-t border-[var(--border)]/50">
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
      </div>
    </motion.section>
  );
}
