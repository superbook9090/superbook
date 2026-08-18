'use client';

import React from 'react';
import { ChevronRight, CornerLeftUp, Folder, Home } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import type { BreadcrumbItem } from './types';

interface FilesBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  totalItems: number;
  onGoToCrumb: (index: number) => void;
  onGoToParent: () => void;
}

export function FilesBreadcrumbs({
  breadcrumbs,
  totalItems,
  onGoToCrumb,
  onGoToParent,
}: FilesBreadcrumbsProps) {
  const { t } = useTranslation();
  const canGoUp = breadcrumbs.length > 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
        {canGoUp && (
          <Tooltip label={t('files.parentFolder') || 'Up One Level'}>
            <button
              type="button"
              onClick={onGoToParent}
              className="p-1.5 sm:p-2 rounded-xl bg-[var(--color-surface-muted)] hover:bg-[var(--primary-soft)] text-[var(--color-foreground)] hover:text-[var(--primary)] border border-[var(--border)] transition-colors inline-flex items-center justify-center shrink-0"
              aria-label={t('files.parentFolder') || 'Up One Level'}
            >
              <CornerLeftUp className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const isRoot = idx === 0;

            return (
              <div key={`${crumb.id || 'root'}-${idx}`} className="flex items-center gap-1 sm:gap-1.5">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />}

                <button
                  type="button"
                  onClick={() => onGoToCrumb(idx)}
                  disabled={isLast}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isLast
                      ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-semibold border border-[var(--primary-border)] shadow-xs cursor-default'
                      : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]'
                  }`}
                  title={crumb.name}
                >
                  {isRoot ? (
                    <Home className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 shrink-0 text-[var(--color-warning)]" />
                  )}
                  <span className="truncate max-w-[100px] sm:max-w-[160px] md:max-w-[220px]">
                    {crumb.name}
                  </span>
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-muted-foreground)] shrink-0">
        <span>{totalItems}</span>
        <span>{totalItems === 1 ? t('files.oneItem') || 'item' : t('files.itemCount', { count: totalItems }) || 'items'}</span>
      </div>
    </div>
  );
}
