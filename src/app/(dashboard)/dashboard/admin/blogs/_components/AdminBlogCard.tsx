'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Edit2, Eye, EyeOff, Trash2, Tag, User, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/dateUtils';
import { useTranslation } from '@/hooks/useTranslation';
import type { Blog } from '@/lib/react-query/useBlogQueries';

interface AdminBlogCardProps {
  blog: Blog;
  index: number;
  canManage: boolean;
  onTogglePublish: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function AdminBlogCard({
  blog,
  canManage,
  onTogglePublish,
  onDelete,
}: AdminBlogCardProps) {
  const { t } = useTranslation();

  return (
    <div className="teacher-card p-4 sm:p-5 flex flex-col justify-between gap-4 group">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
            <Tag className="w-3 h-3 shrink-0" />
            <span className="capitalize">{blog.topic || 'Article'}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {blog.locale && (
              <span className="px-2 py-0.5 rounded-[6px] bg-[var(--surface-muted)] text-[10px] font-bold uppercase text-[var(--color-muted-foreground)]">
                {blog.locale}
              </span>
            )}
            <Badge variant={blog.isPublished ? 'default' : 'secondary'}>
              {blog.isPublished ? t('common.published') : t('common.draft')}
            </Badge>
          </div>
        </div>

        <h3 className="text-base font-bold text-[var(--color-foreground)] group-hover:text-[var(--teacher-primary)] transition-colors line-clamp-2 min-h-[2.75rem] leading-snug">
          {blog.title}
        </h3>

        <div className="space-y-1.5 pt-2.5 border-t border-[var(--border)]/70 text-xs text-[var(--color-muted-foreground)]">
          {blog.author && (
            <div className="flex items-center gap-1.5 font-medium text-[var(--color-foreground)] truncate">
              <User className="w-3.5 h-3.5 text-[var(--teacher-primary)] shrink-0" />
              <span className="truncate">{blog.author.name || blog.author.email || 'Author'}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 shrink-0">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(blog.createdAt)}</span>
            </span>
            {blog.slug && (
              <span className="font-mono text-[11px] text-[var(--teacher-primary)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded truncate max-w-[160px]">
                /blog/{blog.slug}
              </span>
            )}
            {blog.readTime && <span className="shrink-0">{blog.readTime} min</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]/70">
        <div className="flex items-center gap-1.5">
          {canManage && (
            <>
              <Tooltip label={blog.isPublished ? t('common.unpublish') : t('common.publish')}>
                <button
                  type="button"
                  onClick={() => onTogglePublish(blog._id, blog.isPublished)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] transition-colors cursor-pointer ${
                    blog.isPublished
                      ? 'text-[var(--success)] bg-[var(--success-light)] border-[var(--success)]/25'
                      : 'text-[var(--color-muted-foreground)] bg-[var(--surface-muted)] hover:text-[var(--color-foreground)]'
                  }`}
                >
                  {blog.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </Tooltip>

              <Tooltip label={t('common.edit')}>
                <Link
                  href={ROUTES.teacher.blogEdit(blog._id)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
              </Tooltip>
            </>
          )}

          {blog.isPublished && (
            <Tooltip label={t('createBlogPage.viewPublicBlog')}>
              <Link
                href={ROUTES.blog(blog.slug || blog._id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] transition-colors"
                aria-label={t('createBlogPage.viewPublicBlog')}
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Tooltip>
          )}
        </div>

        {canManage && (
          <Tooltip label={t('common.delete')}>
            <button
              type="button"
              onClick={() => onDelete(blog._id)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
