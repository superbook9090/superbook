'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Edit2, Eye, EyeOff, Trash2, Tag, ExternalLink } from 'lucide-react';
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
  onTogglePublish,
  onDelete,
}: TeacherBlogCardProps) {
  const { t } = useTranslation();

  return (
    <article className="teacher-card p-4 sm:p-5 flex flex-col justify-between group h-full">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
            <Tag className="w-3 h-3 shrink-0" />
            <span className="capitalize">{blog.topic}</span>
          </span>

          <Badge variant={blog.isPublished ? 'success' : 'default'} size="sm" className="font-bold">
            {blog.isPublished ? t('blog.published') : t('blog.draft')}
          </Badge>
        </div>

        <h3 className="text-base font-bold text-[var(--color-foreground)] group-hover:text-[var(--teacher-primary)] transition-colors line-clamp-2 min-h-[2.75rem]">
          {blog.title}
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[var(--color-muted-foreground)]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDate(blog.createdAt)}</span>
          </span>
          {blog.slug && (
            <span className="font-mono text-[11px] text-[var(--teacher-primary)] bg-[var(--teacher-soft)] px-2 py-0.5 rounded-md border border-[var(--teacher-border)]/60 truncate max-w-[180px]">
              /blog/{blog.slug}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3.5 mt-4 border-t border-[var(--border)]/70">
        <div className="flex items-center gap-1.5">
          <Tooltip label={t('blog.edit')}>
            <Link
              href={ROUTES.teacher.blogEdit(blog._id)}
              aria-label={t('blog.edit')}
              className="teacher-cta-btn text-xs px-3.5 min-h-[42px]"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{t('blog.edit')}</span>
            </Link>
          </Tooltip>

          <Tooltip label={blog.isPublished ? t('blog.unpublish') : t('blog.publish')}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onTogglePublish(blog._id, blog.isPublished)}
              className="min-h-[42px] min-w-[42px] p-0 rounded-xl"
              aria-label={blog.isPublished ? t('blog.unpublish') : t('blog.publish')}
            >
              {blog.isPublished ? (
                <Eye className="w-4 h-4 text-[var(--teacher-primary)]" />
              ) : (
                <EyeOff className="w-4 h-4 text-[var(--color-muted-foreground)]" />
              )}
            </Button>
          </Tooltip>

          {blog.isPublished && (
            <Tooltip label={t('createBlogPage.viewPublicBlog')}>
              <Link
                href={ROUTES.blog(blog.slug || blog._id)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('createBlogPage.viewPublicBlog')}
                className="min-h-[42px] min-w-[42px] bg-[var(--surface-muted)] text-[var(--color-foreground)] rounded-xl hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] border border-[var(--border)] flex items-center justify-center transition-colors focus-ring"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Tooltip>
          )}
        </div>

        <Tooltip label={t('blog.delete')}>
          <Button
            type="button"
            variant="danger"
            onClick={() => onDelete(blog._id)}
            className="min-h-[42px] min-w-[42px] p-0 rounded-xl"
            aria-label={t('blog.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </article>
  );
}
