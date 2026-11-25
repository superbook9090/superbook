'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Award,
  Settings,
  ArrowRight,
  Sparkles,
  Compass,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import type { AdminStats } from './types';

interface AdminOverviewHighlightsProps {
  stats: AdminStats;
  completionRate: number;
}

export function AdminOverviewHighlights({ stats, completionRate }: AdminOverviewHighlightsProps) {
  const { t } = useTranslation();

  const quickLinks = [
    {
      href: ROUTES.admin.users,
      label: t('adminAnalytics.manageUsers'),
      icon: Users,
      tone: 'bg-sky-500/12 text-sky-600 dark:text-sky-400 border-sky-500/20',
    },
    {
      href: ROUTES.admin.courses,
      label: t('adminAnalytics.manageCourses'),
      icon: BookOpen,
      tone: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      href: ROUTES.admin.quizzes,
      label: t('adminAnalytics.manageQuizzes'),
      icon: Award,
      tone: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border-[var(--teacher-border)]',
    },
    {
      href: ROUTES.admin.settings,
      label: t('adminAnalytics.manageSettings'),
      icon: Settings,
      tone: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
  ];

  const pipelines = [
    {
      label: t('adminAnalytics.totalCourses'),
      published: stats.courses.published,
      total: stats.courses.total,
      pct: stats.courses.total > 0 ? Math.round((stats.courses.published / stats.courses.total) * 100) : 0,
      barClass: 'bg-emerald-500',
    },
    {
      label: t('adminAnalytics.totalQuizzes'),
      published: stats.quizzes.published,
      total: stats.quizzes.total,
      pct: stats.quizzes.total > 0 ? Math.round((stats.quizzes.published / stats.quizzes.total) * 100) : 0,
      barClass: 'bg-[var(--teacher-primary)]',
    },
    ...(stats.blogs && stats.blogs.total > 0
      ? [
          {
            label: t('adminAnalytics.totalBlogs'),
            published: stats.blogs.published,
            total: stats.blogs.total,
            pct: Math.round((stats.blogs.published / stats.blogs.total) * 100),
            barClass: 'bg-sky-500',
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
      {/* Content Pipeline */}
      <div className="teacher-panel p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]/70">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <BookOpen className="w-4 h-4" />
          </span>
          <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
            {t('adminAnalytics.contentPipeline')}
          </h3>
        </div>

        <div className="space-y-4">
          {pipelines.map((p) => (
            <div key={p.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[var(--color-foreground)] truncate">{p.label}</span>
                <span className="font-bold tabular-nums text-[var(--color-muted-foreground)] shrink-0">
                  {p.published} / {p.total}{' '}
                  <span className="text-[var(--color-foreground)]">({p.pct}%)</span>
                </span>
              </div>
              <div className="w-full bg-[var(--surface-muted-strong)] rounded-full h-2 overflow-hidden">
                <div
                  className={`${p.barClass} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Health Benchmarks */}
      <div className="teacher-panel p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]/70">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-amber-500/12 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
            {t('adminAnalytics.learningHealth')}
          </h3>
        </div>

        <div className="space-y-3 flex-1 flex flex-col justify-center">
          <div className="p-3.5 rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/70 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--color-muted-foreground)] truncate">
                {t('adminAnalytics.averageScore')}
              </p>
              <p className="text-xl font-extrabold font-[family-name:var(--font-display)] tabular-nums text-[var(--color-foreground)] mt-0.5">
                {stats.quizzes.averageScore}%
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
              {stats.quizzes.averageScore >= 70
                ? t('adminAnalytics.highPerformers')
                : t('adminAnalytics.averagePerformers')}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/70 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--color-muted-foreground)] truncate">
                {t('adminAnalytics.completionRate')}
              </p>
              <p className="text-xl font-extrabold font-[family-name:var(--font-display)] tabular-nums text-[var(--color-foreground)] mt-0.5">
                {completionRate}%
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 tabular-nums shrink-0">
              {stats.enrollments.completed} / {stats.enrollments.total}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Admin Links */}
      <div className="teacher-panel p-4 sm:p-5 flex flex-col gap-4 md:col-span-2 xl:col-span-1">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]/70">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
            <Compass className="w-4 h-4" />
          </span>
          <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
            {t('adminAnalytics.quickLinks')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[var(--surface-muted)]/55 hover:bg-[var(--surface-muted)] border border-[var(--border)]/70 hover:border-[var(--teacher-primary)]/40 transition-all group min-h-[46px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] border shrink-0 ${link.tone}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] group-hover:text-[var(--teacher-primary)] transition-colors truncate">
                    {link.label}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-muted-foreground)] group-hover:text-[var(--teacher-primary)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
