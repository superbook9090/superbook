'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Bookmark, Plus, ShieldCheck, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserRole } from '@/lib/roles';

interface BlogHeroHeaderProps {
  role: UserRole | 'guest';
  userName?: string | null;
  favoritesCount?: number;
  totalBlogs?: number;
}

export default function BlogHeroHeader({
  role,
  userName,
  favoritesCount = 0,
  totalBlogs = 0,
}: BlogHeroHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Main Title Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/10 via-[var(--card-solid)] to-[var(--primary)]/5 p-4 sm:p-6 md:p-8 lg:p-10 shadow-[var(--shadow-sm)]">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--card-solid)] px-3.5 py-1 text-xs font-semibold text-[var(--primary)] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('blog.hubBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--color-foreground)] leading-tight">
            {t('blog.exploreInsights')}
          </h1>

          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl">
            {t('blog.hubSubtitle')}
          </p>
        </div>
      </div>

      {/* Role-Adaptive Contextual Action Banner */}
      {role === 'student' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[var(--student-border)] bg-[var(--student-soft)] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--student-primary)] text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
                {userName ? `Welcome back, ${userName}!` : (t('blog.studentHubBannerTitle'))}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                {t('blog.studentHubBannerDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={ROUTES.student.favorites}
              className="touch-target inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--student-primary)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
            >
              <Bookmark className="w-4 h-4" />
              <span>{t('blog.myFavorites')}</span>
              {favoritesCount > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[11px] font-bold">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <Link
              href={ROUTES.student.root}
              className="touch-target inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--student-border)] bg-[var(--card-solid)] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--student-soft)] transition-colors"
            >
              <span>{t('common.dashboard')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {role === 'teacher' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[var(--teacher-border)] bg-[var(--teacher-soft)] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--teacher-primary)] text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
                {userName ? `Educator Hub • ${userName}` : (t('blog.teacherHubBannerTitle'))}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                {t('blog.teacherHubBannerDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={ROUTES.teacher.blogCreate}
              className="touch-target inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--teacher-primary)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('blog.createBlog')}</span>
            </Link>
            <Link
              href={ROUTES.teacher.blogs}
              className="touch-target inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--teacher-border)] bg-[var(--card-solid)] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--teacher-soft)] transition-colors"
            >
              <span>{t('blog.myBlogs')}</span>
            </Link>
          </div>
        </div>
      )}

      {(role === 'admin' || role === 'superadmin') && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-primary)] text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
                {t('blog.adminHubBannerTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                {t('blog.adminHubBannerDesc')}
                {totalBlogs > 0 && ` (${totalBlogs} articles active)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={ROUTES.admin.blogs}
              className="touch-target inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--admin-primary)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('admin.manageBlogs')}</span>
            </Link>
            <Link
              href={ROUTES.teacher.blogCreate}
              className="touch-target inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--admin-border)] bg-[var(--card-solid)] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--admin-soft)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('blog.createBlog')}</span>
            </Link>
          </div>
        </div>
      )}

      {role === 'guest' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-4 sm:p-5 shadow-[var(--shadow-sm)]">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
              {t('blog.guestBannerTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              {t('blog.guestBannerDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={ROUTES.register}
              className="touch-target inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
            >
              {t('auth.signUpFree')}
            </Link>
            <Link
              href={ROUTES.login}
              className="touch-target inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--color-surface-muted)] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--border)] transition-colors"
            >
              {t('auth.signIn')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
