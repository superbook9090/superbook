'use client';

import React, { useRef, useEffect } from 'react';
import { Search, X, Globe, ArrowUpDown, Tag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { BlogLanguageType, BlogSortType } from './types';

interface BlogTopicTabsProps {
  topics: string[];
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  languageFilter: BlogLanguageType;
  onLanguageChange: (lang: BlogLanguageType) => void;
  sort: BlogSortType;
  onSortChange: (sort: BlogSortType) => void;
  totalCount: number;
}

export default function BlogTopicTabs({
  topics,
  selectedTopic,
  onSelectTopic,
  searchQuery,
  onSearchChange,
  onClearSearch,
  languageFilter,
  onLanguageChange,
  sort,
  onSortChange,
  totalCount,
}: BlogTopicTabsProps) {
  const { t } = useTranslation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allTopicList = ['All', ...topics];

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-4 sm:p-5 shadow-[var(--shadow-sm)]">
      {/* Search and Quick Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('blog.searchBlogs') || 'Search articles, topics, keywords...'}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-20 text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            aria-label="Search articles"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="touch-target absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[var(--border)] bg-[var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-muted-foreground)]">
              /
            </kbd>
          )}
        </div>

        {/* Language & Sort Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Language Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--background)] p-1 shrink-0">
            <Globe className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] ml-1.5" />
            {(['all', 'en', 'hi'] as const).map((langCode) => (
              <button
                key={langCode}
                type="button"
                onClick={() => onLanguageChange(langCode)}
                className={`touch-target rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  languageFilter === langCode
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {langCode === 'all' ? (t('common.all') || 'All') : langCode === 'hi' ? 'हिंदी' : 'EN'}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--background)] p-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] ml-1.5" />
            {(
              [
                { id: 'latest', label: t('blog.latestArticles') || 'Latest' },
                { id: 'popular', label: t('blog.mostPopular') || 'Popular' },
                { id: 'quick', label: t('blog.quickReads') || 'Quick' },
              ] as const
            ).map((sortOpt) => (
              <button
                key={sortOpt.id}
                type="button"
                onClick={() => onSortChange(sortOpt.id)}
                className={`touch-target rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  sort === sortOpt.id
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {sortOpt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
        <div className="flex items-center gap-1 text-xs font-semibold text-[var(--color-muted-foreground)] mr-1 shrink-0">
          <Tag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('blog.topic') || 'Topics'}:</span>
        </div>
        {allTopicList.map((topicItem) => {
          const isSelected =
            (topicItem === 'All' && (!selectedTopic || selectedTopic === 'All')) ||
            selectedTopic.toLowerCase() === topicItem.toLowerCase();

          return (
            <button
              key={topicItem}
              type="button"
              onClick={() => onSelectTopic(topicItem)}
              className={`touch-target whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-[var(--primary)] text-white shadow-sm scale-[1.02]'
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'
              }`}
            >
              {topicItem === 'All' ? (t('common.all') || 'All Topics') : topicItem}
            </button>
          );
        })}
      </div>

      {/* Filter Summary / Active Criteria indicator */}
      {(searchQuery || selectedTopic !== 'All' || languageFilter !== 'all') && (
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs text-[var(--color-muted-foreground)]">
          <span>
            {totalCount} {t('blog.totalArticles') || 'articles found'}
            {selectedTopic !== 'All' ? ` in "${selectedTopic}"` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
          <button
            type="button"
            onClick={() => {
              onClearSearch();
              onSelectTopic('All');
              onLanguageChange('all');
            }}
            className="text-[var(--primary)] font-semibold hover:underline"
          >
            {t('common.clearFilters') || 'Reset all filters'}
          </button>
        </div>
      )}
    </div>
  );
}
