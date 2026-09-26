'use client';

import React from 'react';
import { Filter, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { useTranslation } from '@/hooks/useTranslation';
import type { FileSortOption, FileTypeFilter, ViewMode } from './types';

interface FilesFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  typeFilter: FileTypeFilter;
  onTypeFilterChange: (val: FileTypeFilter) => void;
  sortOption: FileSortOption;
  onSortOptionChange: (val: FileSortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (val: ViewMode) => void;
  onReset: () => void;
}

export function FilesFilterBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sortOption,
  onSortOptionChange,
  viewMode,
  onViewModeChange,
  onReset,
}: FilesFilterBarProps) {
  const { t } = useTranslation();

  const filterChips = [
    {
      label: t('organizations.status'),
      icon: <Filter className="w-3.5 h-3.5" aria-hidden />,
      value: typeFilter,
      onChange: (val: string) => onTypeFilterChange(val as FileTypeFilter),
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('files.allTypes') },
        { id: 'folders', label: t('files.foldersOnly') },
        { id: 'files', label: t('files.filesOnly') },
      ],
    },
    {
      label: t('organizations.sortBy'),
      icon: <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden />,
      value: sortOption,
      onChange: (val: string) => onSortOptionChange(val as FileSortOption),
      neutralValue: 'newest',
      options: [
        { id: 'newest', label: t('files.sortNewest') },
        { id: 'oldest', label: t('files.sortOldest') },
        { id: 'name_asc', label: t('files.sortNameAsc') },
        { id: 'name_desc', label: t('files.sortNameDesc') },
        { id: 'size_desc', label: t('files.sortSize') },
      ],
    },
  ];

  return (
    <FilterPanel>
      <DashboardListFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onClear={onReset}
        searchPlaceholder={t('files.searchPlaceholder')}
        chipGroups={filterChips}
        headerAside={
          <div className="hidden md:flex items-center gap-1 bg-[var(--color-surface-muted)] p-1 rounded-xl border border-[var(--border)]">
            <Tooltip label={t('files.grid')}>
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                aria-pressed={viewMode === 'grid'}
                aria-label={t('files.grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip label={t('files.list')}>
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                aria-pressed={viewMode === 'table'}
                aria-label={t('files.list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        }
      />
    </FilterPanel>
  );
}
