'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Dropdown } from '@/components/ui/Dropdown';
import { TeacherTabs } from '@/features/teacher/components/TeacherTabs';

export type TeacherStatusFilter = 'all' | 'published' | 'draft' | 'private';

interface TeacherCoursesFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: TeacherStatusFilter;
  onStatusChange: (status: TeacherStatusFilter) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  onClear: () => void;
}

export default function TeacherCoursesFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onClear,
}: TeacherCoursesFilterProps) {
  const { t } = useTranslation();
  const hasFilters = Boolean(searchQuery || statusFilter !== 'all' || selectedCategory !== 'All');

  return (
    <div className="teacher-panel p-3.5 sm:p-4 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        <div className="relative flex-1 min-w-0 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] group-focus-within:text-[var(--teacher-primary)] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('teacherCourses.searchPlaceholder')}
            className="w-full min-h-[42px] pl-10 pr-9 py-2 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/25 focus:border-[var(--teacher-primary)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label={t('common.reset')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="w-full md:w-56 shrink-0">
            <Dropdown
              id="teacher-course-category"
              startIcon={<SlidersHorizontal className="w-4 h-4" />}
              value={selectedCategory}
              onChange={onCategoryChange}
              options={[
                { value: 'All', label: t('courses.allCategories') },
                ...categories.map((cat) => ({ value: cat, label: cat })),
              ]}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[var(--border)]/70">
        <TeacherTabs
          activeTab={statusFilter}
          onChange={onStatusChange}
          tabs={[
            { id: 'all', label: t('teacherCourses.filterStatusAll') },
            { id: 'published', label: t('teacherCourses.filterStatusPublished'), tone: 'success' },
            { id: 'draft', label: t('teacherCourses.filterStatusDraft'), tone: 'warning' },
            { id: 'private', label: t('teacherCourses.filterStatusPrivate'), tone: 'info' },
          ]}
        />

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-[var(--teacher-primary)] hover:underline px-2 py-1"
          >
            {t('common.reset')}
          </button>
        )}
      </div>
    </div>
  );
}
