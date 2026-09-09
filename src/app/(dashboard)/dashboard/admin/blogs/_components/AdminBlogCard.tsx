'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Edit2, Eye, EyeOff, Trash2, Tag, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/dateUtils';
import { useTranslation } from '@/hooks/useTranslation';
import type { Blog } from '@/lib/react-query/useBlogQueries';

interface AdminBlogCardProps {
  blog: Blog;
  index: number;
  onTogglePublish: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function AdminBlogCard({
  blog,
  index,
  onTogglePublish,
  onDelete,
}: AdminBlogCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ delay: 0.04 * index, duration: 0.25 }}
      className="antigravity-glass antigravity-card rounded-3xl border border-[var(--border)] p-5 sm:p-6 hover:border-[var(--teacher-primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
    >
      <div className="space-y-3.5">
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shadow-2xs">
            <Tag className="w-3 h-3 shrink-0" />
            <span className="capitalize">{blog.topic || 'Article'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {blog.locale && (
              <span className="px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] text-[10px] font-bold uppercase text-[var(--color-muted-foreground)]">
                {blog.locale}
              </span>
            )}
            <Badge variant={blog.isPublished ? 'success' : 'default'} size="sm" className="font-bold">
              {blog.isPublished ? t('common.published') || 'Published' : t('common.draft') || 'Draft'}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] group-hover:text-[var(--teacher-primary)] transition-colors line-clamp-2 leading-snug">
            {blog.title}
          </h3>
        </div>

        {/* Meta Info */}
        <div className="space-y-1.5 pt-2 border-t border-[var(--border)] text-xs text-[var(--color-muted-foreground)]">
          {blog.author && (
            <div className="flex items-center gap-1.5 font-medium text-[var(--color-foreground)] truncate">
              <User className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              <span className="truncate">{blog.author.name || blog.author.email || 'Author'}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(blog.createdAt)}</span>
            </span>
            {blog.readTime && <span>{blog.readTime} min read</span>}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Tooltip label={blog.isPublished ? t('common.unpublish') || 'Unpublish' : t('common.publish') || 'Publish'}>
            <button
              type="button"
              onClick={() => onTogglePublish(blog._id, blog.isPublished)}
              className={`p-2 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                blog.isPublished
                  ? 'text-[var(--success)] bg-[var(--success-light)]'
                  : 'text-[var(--color-muted-foreground)] bg-[var(--surface-muted)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {blog.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </Tooltip>

          <Tooltip label={t('common.edit') || 'Edit'}>
            <Link
              href={ROUTES.teacher.blogEdit(blog._id)}
              className="p-2 min-h-[40px] min-w-[40px] bg-[var(--surface-muted)] text-[var(--color-foreground)] rounded-xl hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] flex items-center justify-center transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
          </Tooltip>
        </div>

        <Tooltip label={t('common.delete') || 'Delete'}>
          <button
            type="button"
            onClick={() => onDelete(blog._id)}
            className="p-2 min-h-[40px] min-w-[40px] text-[var(--color-muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error-light)] rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </motion.div>
  );
}
