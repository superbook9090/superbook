'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Eye, Calendar, User, Heart, Edit3, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import type { PublicBlogItem } from './types';
import type { UserRole } from '@/lib/roles';

interface BlogCardProps {
  blog: PublicBlogItem;
  role: UserRole | 'guest';
  currentUserId?: string;
  isFavorited?: boolean;
  onToggleFavorite?: (blogId: string) => void;
}

export default function BlogCard({
  blog,
  role,
  currentUserId,
  isFavorited = false,
  onToggleFavorite,
}: BlogCardProps) {
  const { t } = useTranslation();
  const isAuthor = Boolean(currentUserId && blog.author?._id === currentUserId);
  const isAdminRole = role === 'admin' || role === 'superadmin';

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-5 sm:p-6 transition-all duration-300 hover:border-[var(--primary)]/40 hover:shadow-[var(--shadow-md)] hover:-translate-y-1">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              {blog.topic}
            </span>
            {blog.language && blog.language !== 'en' && (
              <span className="inline-flex items-center rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-muted-foreground)]">
                {blog.language === 'hi' ? 'हिंदी' : blog.language.toUpperCase()}
              </span>
            )}
            {blog.isFeatured && (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                ★ {t('blog.spotlightStory') || 'Spotlight'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Student & Guest Favorite Button */}
            {onToggleFavorite && (
              <Tooltip label={isFavorited ? (t('favorites.removeFromFavorites') || 'Remove from favorites') : (t('blog.addToFavorites') || 'Add to favorites')}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite(blog._id);
                  }}
                  className="touch-target inline-flex items-center justify-center p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  aria-label={isFavorited ? 'Remove favorite' : 'Add favorite'}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform active:scale-125 ${
                      isFavorited ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                </button>
              </Tooltip>
            )}

            {/* Author Quick Edit Action */}
            {isAuthor && (
              <Tooltip label={t('blog.editArticle') || 'Edit your article'}>
                <Link
                  href={ROUTES.teacher.blogEdit(blog._id)}
                  className="touch-target inline-flex items-center justify-center p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--teacher-primary)] hover:bg-[var(--teacher-soft)] transition-colors"
                  aria-label="Edit article"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
              </Tooltip>
            )}

            {/* Admin Quick Action */}
            {isAdminRole && (
              <Tooltip label={t('blog.adminModerate') || 'Admin Moderate'}>
                <Link
                  href={ROUTES.admin.blogs}
                  className="touch-target inline-flex items-center justify-center p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--admin-primary)] hover:bg-[var(--admin-soft)] transition-colors"
                  aria-label="Moderate in admin"
                >
                  <ShieldCheck className="w-4 h-4" />
                </Link>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-foreground)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          <Link href={ROUTES.blog(blog.slug)} className="hover:underline focus:outline-none">
            {blog.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="mt-2.5 text-sm text-[var(--color-muted-foreground)] line-clamp-3 leading-relaxed">
          {blog.excerpt}
        </p>
      </div>

      {/* Footer Meta & Link */}
      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted-foreground)]">
          {/* Author & Read Time */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold flex items-center justify-center text-[10px]">
                {blog.author?.name ? blog.author.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
              </div>
              <span className="font-medium text-[var(--color-foreground)] max-w-[120px] truncate">
                {blog.author?.name || t('blog.teacher') || 'Educator'}
              </span>
              {isAuthor && (
                <span className="rounded bg-[var(--teacher-soft)] text-[var(--teacher-primary)] text-[10px] font-semibold px-1.5 py-0.2">
                  {t('blog.yourArticle') || 'You'}
                </span>
              )}
            </div>

            <span className="hidden sm:inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {blog.readingTimeMinutes} {t('quiz.min') || 'min'}
            </span>
          </div>

          {/* Date & Views */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            {blog.viewCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {blog.viewCount}
              </span>
            )}
            <Link
              href={ROUTES.blog(blog.slug)}
              className="inline-flex items-center gap-0.5 font-semibold text-[var(--primary)] hover:underline ml-1"
              aria-label={`Read ${blog.title}`}
            >
              <span className="hidden xs:inline">{t('favorites.readArticle') || 'Read'}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
