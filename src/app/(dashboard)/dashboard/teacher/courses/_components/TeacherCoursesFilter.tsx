'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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

  const statusOptions: { id: TeacherStatusFilter; label: string }[] = [
    { id: 'all', label: t('teacherCourses.filterStatusAll') },
    { id: 'published', label: t('teacherCourses.filterStatusPublished') },
    { id: 'draft', label: t('teacherCourses.filterStatusDraft') },
    { id: 'private', label: t('teacherCourses.filterStatusPrivate') },
  ];

  return (
    <div className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl p-4 shadow-[var(--shadow-sm)] space-y-3.5">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-full flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('teacherCourses.searchPlaceholder')}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full md:w-auto py-2.5 px-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-xs sm:text-sm font-semibold text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]"
            >
              <option value="All">{t('courses.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Status Segmented Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border)]">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusOptions.map((opt) => {
            const isActive = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onStatusChange(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[var(--teacher-primary)] text-white shadow-sm'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted-strong)]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {(searchQuery || statusFilter !== 'all' || selectedCategory !== 'All') && (
          <button
            onClick={onClear}
            className="text-xs font-bold text-[var(--teacher-primary)] hover:underline"
          >
            {t('common.reset')}
          </button>
        )}
      </div>
    </div>
  );
}
