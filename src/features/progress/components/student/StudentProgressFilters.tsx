'use client';

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface StudentProgressFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: 'all' | 'active' | 'completed';
  onStatusFilterChange: (status: 'all' | 'active' | 'completed') => void;
  sortBy: 'recent' | 'highest_progress' | 'lowest_progress' | 'highest_score';
  onSortByChange: (sort: 'recent' | 'highest_progress' | 'lowest_progress' | 'highest_score') => void;
}

export function StudentProgressFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}: StudentProgressFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="card-surface p-3 sm:p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('progress.searchCoursePlaceholder')}
          className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--color-surface-muted)] border border-[var(--border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--student-primary)]"
        />
      </div>

      {/* Status Pills & Sort */}
      <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
        {/* Status Filter Buttons */}
        <div className="inline-flex p-1 bg-[var(--color-surface-muted)] rounded-lg border border-[var(--border)]">
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-[var(--card-solid)] text-[var(--student-primary)] shadow-sm'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {t('progress.allStatuses')}
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('active')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'active'
                ? 'bg-[var(--card-solid)] text-[var(--warning)] shadow-sm'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {t('progress.inProgress')}
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('completed')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'completed'
                ? 'bg-[var(--card-solid)] text-[var(--success)] shadow-sm'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {t('progress.completed')}
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as typeof sortBy)}
            className="text-xs py-1.5 px-2.5 bg-[var(--color-surface-muted)] border border-[var(--border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--student-primary)]"
          >
            <option value="recent">{t('progress.recentlyEnrolled')}</option>
            <option value="highest_progress">{t('progress.highestProgress')}</option>
            <option value="lowest_progress">{t('progress.lowestProgress')}</option>
            <option value="highest_score">{t('progress.highestScore')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
