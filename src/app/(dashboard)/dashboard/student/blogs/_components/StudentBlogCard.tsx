'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Calendar, User, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { formatDate } from '@/lib/dateUtils';
import { ROUTES } from '@/constants/routes';
import type { Blog } from '@/lib/react-query/useBlogQueries';

interface StudentBlogCardProps {
  blog: Blog;
  index: number;
  isFavorited: boolean;
  onToggleFavorite: (blogId: string) => void;
  themeText: string;
  t: (key: string) => string;
}

export function StudentBlogCard({
  blog,
  index,
  isFavorited,
  onToggleFavorite,
  themeText,
  t,
}: StudentBlogCardProps) {
  const plainText = blog.content.replace(/<[^>]*>/g, '');
  const excerpt = plainText.substring(0, 140) + (plainText.length > 140 ? '...' : '');

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.04 * index, 0.24), duration: 0.25 }}
      className="student-card overflow-hidden group flex flex-col justify-between"
    >
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge variant="primary" size="sm" className="font-semibold">
              {blog.topic}
            </Badge>
            <Tooltip
              label={
                isFavorited
                  ? t('favorites.removeFromFavorites')
                  : t('blog.addToFavorites')
              }
            >
              <button
                type="button"
                onClick={() => onToggleFavorite(blog._id)}
                aria-label={
                  isFavorited
                    ? t('favorites.removeFromFavorites')
                    : t('blog.addToFavorites')
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--student-primary)] transition-colors cursor-pointer focus-ring"
              >
                <Heart
                  className={`w-4 h-4 transition-transform ${
                    isFavorited ? 'fill-current text-[var(--error)] scale-110' : ''
                  }`}
                />
              </button>
            </Tooltip>
          </div>

          <Link href={ROUTES.student.blog(blog.slug || blog._id)} className="block focus-ring rounded-lg">
            <h3 className="text-base font-bold text-[var(--color-foreground)] mb-1.5 line-clamp-2 group-hover:text-[var(--student-primary)] transition-colors">
              {blog.title}
            </h3>
            <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">
              {excerpt}
            </p>
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border)]/70 text-xs text-[var(--color-muted-foreground)]">
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-1 truncate">
              <User className="w-3.5 h-3.5 text-[var(--student-primary)] shrink-0" />
              <span className="truncate">{blog.author?.name || t('blog.teacher')}</span>
            </span>
            <span className="inline-flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formatDate(blog.createdAt)}</span>
            </span>
          </div>

          <Link
            href={ROUTES.student.blog(blog.slug || blog._id)}
            className={`inline-flex items-center gap-1 ${themeText} text-xs font-bold shrink-0 hover:opacity-80 transition-opacity`}
          >
            <span>{t('blog.readMore')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
