'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Edit2, Eye, EyeOff, Trash2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/dateUtils';
import { useTranslation } from '@/hooks/useTranslation';
import type { Blog } from '@/lib/react-query/useBlogQueries';

interface TeacherBlogCardProps {
  blog: Blog;
  index: number;
  onTogglePublish: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export default function TeacherBlogCard({
  blog,
  index,
  onTogglePublish,
  onDelete,
}: TeacherBlogCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ delay: 0.05 * index, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface antigravity-glass rounded-3xl border border-[var(--border)] p-5 sm:p-6 hover:border-[var(--teacher-primary)]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
            <Tag className="w-3 h-3 shrink-0" />
            <span className="capitalize">{blog.topic}</span>
          </div>

          <Badge variant={blog.isPublished ? 'success' : 'default'} size="sm" className="font-bold">
            {blog.isPublished ? t('blog.published') : t('blog.draft')}
          </Badge>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] group-hover:text-[var(--teacher-primary)] transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-muted-foreground)]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(blog.createdAt)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Tooltip label={blog.isPublished ? t('blog.unpublish') : t('blog.publish')}>
            <Button
              type="button"
              variant={blog.isPublished ? 'primary' : 'secondary'}
              onClick={() => onTogglePublish(blog._id, blog.isPublished)}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl shadow-xs hover:shadow-sm transition-all"
              aria-label={blog.isPublished ? t('blog.unpublish') : t('blog.publish')}
            >
              {blog.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </Tooltip>

          <Tooltip label={t('blog.edit')}>
            <Link
              href={ROUTES.teacher.blogEdit(blog._id)}
              className="p-2.5 min-h-[44px] min-w-[44px] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] rounded-xl hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] hover:border-[var(--teacher-border)] border border-[var(--border)] flex items-center justify-center transition-colors shadow-xs"
              aria-label={t('blog.edit')}
            >
              <Edit2 className="w-4 h-4" />
            </Link>
          </Tooltip>
        </div>

        <Tooltip label={t('blog.delete')}>
          <Button
            type="button"
            variant="danger"
            onClick={() => onDelete(blog._id)}
            className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl shadow-xs hover:shadow-sm transition-all"
            aria-label={t('blog.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </motion.div>
  );
}
