'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export interface BlogPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BlogListPaginationProps {
  page: number;
  pagination: BlogPaginationMeta;
  onPageChange: (page: number) => void;
}

export default function BlogListPagination({
  page,
  pagination,
  onPageChange,
}: BlogListPaginationProps) {
  const { t } = useTranslation();

  if (pagination.totalPages <= 1) return null;

  const from = (page - 1) * pagination.limit + 1;
  const to = Math.min(page * pagination.limit, pagination.total);

  return (
    <div className="flex items-center justify-between px-1 py-3 sm:px-2 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-[var(--color-foreground)] bg-[var(--card-solid)] border border-[var(--border)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.previous')}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pagination.totalPages, page + 1))}
          disabled={page === pagination.totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-[var(--color-foreground)] bg-[var(--card-solid)] border border-[var(--border)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.next')}
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {t('blog.paginationSummary', { from: String(from), to: String(to), total: String(pagination.total) })}
        </p>
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label={t('common.previous')}
            className="relative inline-flex items-center rounded-l-md px-3 py-2 text-[var(--color-muted-foreground)] ring-1 ring-inset ring-[var(--border)] hover:bg-[var(--color-surface-muted)] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-[var(--color-foreground)] ring-1 ring-inset ring-[var(--border)] bg-[var(--card-solid)]">
            {page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
            aria-label={t('common.next')}
            className="relative inline-flex items-center rounded-r-md px-3 py-2 text-[var(--color-muted-foreground)] ring-1 ring-inset ring-[var(--border)] hover:bg-[var(--color-surface-muted)] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </nav>
      </div>
    </div>
  );
}
