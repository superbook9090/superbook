import React from 'react';
import {
  Search,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Tag as TagIcon,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  NOTE_CATEGORIES,
  type NoteColor,
  type NoteSortOption,
  type NoteViewMode,
} from '@/features/notes/types';

interface NotesFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: NoteColor | 'all';
  onSelectCategory: (cat: NoteColor | 'all') => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: string[];
  categoryCounts: Record<string, number>;
  sortBy: NoteSortOption;
  onSortChange: (sort: NoteSortOption) => void;
  viewMode: NoteViewMode;
  onViewModeChange: (mode: NoteViewMode) => void;
  isFiltered: boolean;
  onClearFilters: () => void;
}

const CATEGORY_KEYS: (NoteColor | 'all')[] = [
  'all',
  'blue',
  'amber',
  'emerald',
  'rose',
  'purple',
  'slate',
];

export function NotesFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  allTags,
  categoryCounts,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  isFiltered,
  onClearFilters,
}: NotesFilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Top row: Search, Sort & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('notes.searchPlaceholder')}
            className="w-full pl-10 pr-10 py-2.5 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl text-base sm:text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 transition-all min-h-[44px]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] rounded-md transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Controls: Sort Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <div className="relative flex-1 sm:flex-none">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-foreground)] min-h-[44px]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-muted)] flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as NoteSortOption)}
                aria-label={t('notes.sortBy')}
                className="bg-transparent border-none text-xs font-medium text-[var(--color-foreground)] focus:outline-none cursor-pointer pr-4"
              >
                <option value="updatedAt-desc">{t('notes.sortRecentlyUpdated')}</option>
                <option value="createdAt-desc">{t('notes.sortNewest')}</option>
                <option value="createdAt-asc">{t('notes.sortOldest')}</option>
                <option value="title-asc">{t('notes.sortTitleAsc')}</option>
                <option value="wordCount-desc">{t('notes.sortWordCountDesc')}</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl min-h-[44px]">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px] ${
                viewMode === 'grid'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }`}
              title={t('notes.viewGrid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px] ${
                viewMode === 'list'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }`}
              title={t('notes.viewList')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle row: Category Color Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORY_KEYS.map((catKey) => {
          const isSelected = selectedCategory === catKey;
          const config = catKey === 'all' ? null : NOTE_CATEGORIES[catKey];
          const count = categoryCounts[catKey] || 0;
          const label = catKey === 'all' ? t('notes.allCategories') : t(config?.labelKey || '');

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => onSelectCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border min-h-[38px] cursor-pointer ${
                isSelected
                  ? 'bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)] shadow-xs'
                  : 'bg-[var(--card-solid)] text-[var(--color-foreground)] border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              {config && (
                <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
              )}
              <span>{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-[var(--color-background)]/20 text-[var(--color-background)] font-bold'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom row: Active Tags & Clear Filters if any */}
      {(allTags.length > 0 || isFiltered) && (
        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-[var(--color-muted)] flex items-center gap-1 mr-1">
              <TagIcon className="w-3 h-3" />
              Tags:
            </span>
            {allTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border min-h-[32px] cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-[var(--card-solid)] text-[var(--color-foreground)] border-[var(--color-border)] hover:border-purple-400'
                  }`}
                >
                  <span>#{tag}</span>
                  {isSelected && <X className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors min-h-[32px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('notes.clearFilters')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
