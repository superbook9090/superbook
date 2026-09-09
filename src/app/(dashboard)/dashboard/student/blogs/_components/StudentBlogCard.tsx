'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Calendar, User, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
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
  const excerpt =
    plainText.substring(0, 140) + (plainText.length > 140 ? '...' : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 4 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: Math.min(0.06 * index, 0.3) }}
      className="antigravity-glass antigravity-card rounded-3xl border border-[var(--border)] shadow-xs hover:shadow-xl hover:border-[var(--student-primary)]/40 transition-all overflow-hidden group transform-3d flex flex-col justify-between"
    >
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Topic Badge & Favorite */}
          <div className="flex items-center justify-between mb-3.5">
            <Badge variant="primary" size="sm" className="font-bold">
              {blog.topic}
            </Badge>
            <Tooltip
              label={
                isFavorited
                  ? t('favorites.removeFromFavorites')
                  : t('blog.addToFavorites')
              }
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => onToggleFavorite(blog._id)}
                aria-label={
                  isFavorited
                    ? t('favorites.removeFromFavorites')
                    : t('blog.addToFavorites')
                }
                className="p-2 rounded-xl flex items-center justify-center min-h-[38px] min-w-[38px] hover:bg-[var(--surface-muted)]"
              >
                <Heart
                  className={`w-4 h-4 transition-all duration-200 ${
                    isFavorited
                      ? 'fill-current text-[var(--primary)] scale-110 drop-shadow-[0_0_8px_var(--primary)]'
                      : 'text-[var(--color-muted-foreground)] hover:text-[var(--primary)]'
                  }`}
                />
              </Button>
            </Tooltip>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] mb-2 line-clamp-2 group-hover:text-[var(--student-primary)] transition-colors">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </div>

        <div>
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted-foreground)] pt-3 border-t border-[var(--border)] mb-3">
            <span className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-[var(--student-primary)]" />
              {blog.author?.name || t('blog.teacher')}
            </span>
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {formatDate(blog.createdAt)}
            </span>
          </div>

          {/* Read More Link */}
          <Link
            href={ROUTES.student.blog(blog._id)}
            className={`inline-flex items-center ${themeText} text-xs sm:text-sm font-bold hover:opacity-80 transition-opacity touch-manipulation`}
          >
            {t('blog.readMore')}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
