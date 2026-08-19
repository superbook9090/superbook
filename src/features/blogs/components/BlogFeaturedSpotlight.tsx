'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Clock, Eye, Calendar, User, ArrowRight, Heart, Edit3, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import type { PublicBlogItem } from './types';
import type { UserRole } from '@/lib/roles';

interface BlogFeaturedSpotlightProps {
  blog: PublicBlogItem;
  role: UserRole | 'guest';
  currentUserId?: string;
  isFavorited?: boolean;
  onToggleFavorite?: (blogId: string) => void;
}

export default function BlogFeaturedSpotlight({
  blog,
  role,
  currentUserId,
  isFavorited = false,
  onToggleFavorite,
}: BlogFeaturedSpotlightProps) {
  const { t } = useTranslation();
  const isAuthor = Boolean(currentUserId && blog.author?._id === currentUserId);
  const isAdminRole = role === 'admin' || role === 'superadmin';

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--card-solid)] via-[var(--color-surface-muted)]/50 to-[var(--card-solid)] p-6 sm:p-8 lg:p-10 shadow-[var(--shadow-md)]">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[var(--primary)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-[var(--primary)]/5 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-3xl space-y-4">
          {/* Spotlight Tag & Topic */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {t('blog.spotlightStory') || 'Spotlight Story'}
            </span>
            <span className="inline-flex items-center rounded-full bg-[var(--card-solid)] border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              {blog.topic}
            </span>
            {blog.language && blog.language !== 'en' && (
              <span className="inline-flex items-center rounded-full bg-[var(--card-solid)] border border-[var(--border)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-muted-foreground)]">
                {blog.language === 'hi' ? 'हिंदी' : blog.language.toUpperCase()}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--color-foreground)] leading-snug">
            <Link href={ROUTES.blog(blog.slug)} className="hover:text-[var(--primary)] transition-colors">
              {blog.title}
            </Link>
          </h2>

          {/* Excerpt */}
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] line-clamp-3 leading-relaxed max-w-2xl">
            {blog.excerpt}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[var(--color-muted-foreground)] pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-bold flex items-center justify-center text-xs">
                {blog.author?.name ? blog.author.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="font-semibold text-[var(--color-foreground)]">
                {blog.author?.name || t('blog.teacher') || 'Educator'}
              </span>
              {isAuthor && (
                <span className="rounded bg-[var(--teacher-soft)] text-[var(--teacher-primary)] text-xs font-semibold px-2 py-0.5">
                  {t('blog.yourArticle') || 'You'}
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>

            <span className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {blog.readingTimeMinutes} {t('blog.minRead') || 'min read'}
            </span>

            {blog.viewCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {blog.viewCount} {t('blog.views') || 'views'}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]">
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <Tooltip label={isFavorited ? (t('favorites.removeFromFavorites') || 'Remove from favorites') : (t('blog.addToFavorites') || 'Add to favorites')}>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(blog._id)}
                  className="touch-target inline-flex items-center justify-center p-3 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-muted-foreground)] hover:text-rose-500 hover:border-rose-500/40 shadow-sm transition-all"
                  aria-label={isFavorited ? 'Remove favorite' : 'Add favorite'}
                >
                  <Heart
                    className={`w-5 h-5 transition-transform active:scale-125 ${
                      isFavorited ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                </button>
              </Tooltip>
            )}

            {isAuthor && (
              <Tooltip label={t('blog.editArticle') || 'Edit your article'}>
                <Link
                  href={ROUTES.teacher.blogEdit(blog._id)}
                  className="touch-target inline-flex items-center justify-center p-3 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-muted-foreground)] hover:text-[var(--teacher-primary)] hover:border-[var(--teacher-primary)] shadow-sm transition-all"
                  aria-label="Edit article"
                >
                  <Edit3 className="w-5 h-5" />
                </Link>
              </Tooltip>
            )}

            {isAdminRole && (
              <Tooltip label={t('blog.adminModerate') || 'Admin Moderate'}>
                <Link
                  href={ROUTES.admin.blogs}
                  className="touch-target inline-flex items-center justify-center p-3 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-muted-foreground)] hover:text-[var(--admin-primary)] hover:border-[var(--admin-primary)] shadow-sm transition-all"
                  aria-label="Admin Moderate"
                >
                  <ShieldCheck className="w-5 h-5" />
                </Link>
              </Tooltip>
            )}
          </div>

          <Link
            href={ROUTES.blog(blog.slug)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-md hover:opacity-95 hover:shadow-lg transition-all active:scale-[0.98] shrink-0"
          >
            <span>{t('blog.readFullArticle') || 'Read Full Article'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
