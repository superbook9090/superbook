'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import { useTranslation } from '@/hooks/useTranslation';

interface UsersPaginationBarProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function UsersPaginationBar({
  page,
  pageSize,
  total,
  totalPages,
  isFetching,
  onPageChange,
  onPageSizeChange,
}: UsersPaginationBarProps) {
  const { t } = useTranslation();

  if (total <= 0) return null;

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const navBtnClass =
    'inline-flex items-center justify-center h-9 w-9 rounded-[10px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer';

  return (
    <div className="teacher-panel flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
        <p className="text-xs sm:text-sm font-medium text-[var(--color-muted-foreground)] tabular-nums">
          {t('admin.showing')
            .replace('{current}', `${rangeStart}–${rangeEnd}`)
            .replace('{total}', total.toLocaleString())}
        </p>

        <div className="inline-flex items-center gap-1 p-0.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs">
          {[20, 50, 100].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onPageSizeChange(size)}
              className={`px-2.5 py-1 rounded-[8px] font-bold transition-colors cursor-pointer tabular-nums ${
                pageSize === size
                  ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={page === 1 || isFetching}
            aria-label="First page"
            className={navBtnClass}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <Tooltip label={t('common.previous')}>
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isFetching}
              aria-label={t('common.previous')}
              className={navBtnClass}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </Tooltip>

          <span className="px-3 text-xs sm:text-sm font-bold text-[var(--color-foreground)] tabular-nums">
            {t('admin.page')
              .replace('{current}', String(page))
              .replace('{total}', String(totalPages))}
          </span>

          <Tooltip label={t('common.next')}>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isFetching}
              aria-label={t('common.next')}
              className={navBtnClass}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </Tooltip>

          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages || isFetching}
            aria-label="Last page"
            className={navBtnClass}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
