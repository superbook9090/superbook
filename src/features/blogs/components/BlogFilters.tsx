'use client';

import { Globe, ArrowUpDown } from 'lucide-react';
import DashboardListFilters from '@/components/filters/DashboardListFilters';
import { buildPublishStatusOptions } from '@/components/filters/publishStatusOptions';
import { useTranslation } from '@/hooks/useTranslation';
import { supportedLanguages } from '@/i18n/config';

export type BlogStatusFilter = 'all' | 'published' | 'draft';
export type BlogLanguageFilter = 'all' | 'en' | 'hi';
export type BlogSortOption = 'newest' | 'oldest';

interface BlogFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter?: BlogStatusFilter;
  onStatusChange?: (value: BlogStatusFilter) => void;
  languageFilter: BlogLanguageFilter;
  onLanguageChange: (value: BlogLanguageFilter) => void;
  sort?: BlogSortOption;
  onSortChange?: (value: BlogSortOption) => void;
  /** Topic chips for student blog browse */
  selectedTopic?: string;
  onTopicChange?: (value: string) => void;
  topicOptions?: { id: string; label: string }[];
  onClear: () => void;
  searchPlaceholder?: string;
  statusLabels?: { all: string; published: string; draft: string };
  className?: string;
}

export default function BlogFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  languageFilter,
  onLanguageChange,
  selectedTopic,
  onTopicChange,
  topicOptions = [],
  sort,
  onSortChange,
  onClear,
  searchPlaceholder,
  statusLabels,
  className,
}: BlogFiltersProps) {
  const { t } = useTranslation();

  const languageOptions = [
    { id: 'all', label: t('blog.allLanguages') },
    ...supportedLanguages.map((code) => ({
      id: code,
      label: t(code === 'en' ? 'common.english' : 'common.hindi'),
    })),
  ];

  const chipGroups = [
    ...(topicOptions.length > 0 && onTopicChange && selectedTopic != null
      ? [
          {
            label: t('blog.topic'),
            value: selectedTopic,
            onChange: onTopicChange,
            options: topicOptions,
            neutralValue: 'all',
          },
        ]
      : []),
    {
      label: t('blog.language'),
      icon: <Globe className="w-3.5 h-3.5" aria-hidden />,
      value: languageFilter,
      onChange: (id: string) => onLanguageChange(id as BlogLanguageFilter),
      options: languageOptions,
      neutralValue: 'all',
    },
    ...(sort != null && onSortChange
      ? [
          {
            label: t('blog.sort'),
            icon: <ArrowUpDown className="w-3.5 h-3.5" aria-hidden />,
            value: sort,
            onChange: (id: string) => onSortChange(id as BlogSortOption),
            options: [
              { id: 'newest', label: t('blog.sortNewest') },
              { id: 'oldest', label: t('blog.sortOldest') },
            ],
            neutralValue: 'newest',
          },
        ]
      : []),
  ];

  const labels = statusLabels ?? {
    all: t('blog.allBlogs'),
    published: t('blog.published'),
    draft: t('blog.draft'),
  };

  return (
    <DashboardListFilters
      className={className}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onClear={onClear}
      searchPlaceholder={searchPlaceholder ?? t('blog.searchBlogs')}
      segmentedFilter={
        statusFilter != null && onStatusChange
          ? {
              value: statusFilter,
              onChange: (id) => onStatusChange(id as BlogStatusFilter),
              neutralValue: 'all',
              options: buildPublishStatusOptions(labels),
            }
          : undefined
      }
      chipGroups={chipGroups}
    />
  );
}
