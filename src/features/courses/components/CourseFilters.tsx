'use client';

import React from 'react';
import { Search, Filter, SlidersHorizontal, Clock, CheckCircle, X, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export type CourseStatusFilter = 'all' | 'in-progress' | 'completed';

interface CourseFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  selectedInstructor?: string;
  onInstructorChange?: (value: string) => void;
  instructors?: string[];
  statusFilter?: CourseStatusFilter;
  onStatusChange?: (value: CourseStatusFilter) => void;
  onClear: () => void;
  showStatusFilter?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

export default function CourseFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedInstructor = 'All',
  onInstructorChange,
  instructors = [],
  statusFilter,
  onStatusChange,
  onClear,
  showStatusFilter = false,
  searchPlaceholder = "Search courses...",
  className
}: CourseFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilters = searchQuery || 
                           selectedCategory !== 'All' || 
                           selectedInstructor !== 'All' || 
                           (showStatusFilter && statusFilter !== 'all');

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Search Box */}
        <div className="relative flex-1 max-w-2xl group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--student-primary)] transition-colors" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[var(--card-solid)] border border-[var(--border)] rounded-xl pl-12 pr-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[var(--student-primary)]/20 outline-none transition-all shadow-sm group-hover:shadow-md"
          />
        </div>

        {/* Status Filters (Optional) */}
        {showStatusFilter && onStatusChange && (
          <div className="flex items-center gap-2 bg-[var(--card-solid)] p-1.5 border border-[var(--border)] rounded-xl shadow-sm w-fit">
            {[
              { id: 'all', label: t('common.all'), icon: <SlidersHorizontal className="w-4 h-4" /> },
              { id: 'in-progress', label: t('courses.inProgress'), icon: <Clock className="w-4 h-4" /> },
              { id: 'completed', label: t('courses.completed'), icon: <CheckCircle className="w-4 h-4" /> },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => onStatusChange(filter.id as CourseStatusFilter)}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  statusFilter === filter.id 
                    ? "bg-[var(--student-primary)] text-white shadow-lg" 
                    : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-gray-50"
                )}
              >
                {filter.icon}
                <span className="hidden sm:inline">{filter.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Decorative element for Browse page if no status filter */}
        {!showStatusFilter && (
          <div className="hidden lg:flex items-center gap-3 px-6 py-4 border border-dashed border-[var(--border)] rounded-2xl">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-widest text-[var(--color-muted-foreground)]">
              Find your next mastery
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted-foreground)] mr-2 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            {t('courses.category')}:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                  selectedCategory === cat
                    ? "bg-[var(--student-primary)] border-[var(--student-primary)] text-white shadow-sm"
                    : "bg-[var(--card-solid)] border-[var(--border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-muted-foreground)]"
                )}
              >
                {cat === 'All' ? t('common.all') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Instructor Filters */}
        {instructors.length > 1 && onInstructorChange && (
          <div className="flex flex-wrap items-center gap-3 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-4 sm:pt-0 sm:pl-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted-foreground)] mr-2 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              {t('courses.teacher')}:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {instructors.map(inst => (
                <button
                  key={inst}
                  onClick={() => onInstructorChange(inst)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                    selectedInstructor === inst
                      ? "bg-[var(--student-primary)] border-[var(--student-primary)] text-white shadow-sm"
                      : "bg-[var(--card-solid)] border-[var(--border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-muted-foreground)]"
                  )}
                >
                  {inst === 'All' ? t('common.all') : inst}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            {t('common.reset')}
          </button>
        )}
      </div>
    </div>
  );
}
