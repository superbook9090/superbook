'use client';

import React from 'react';
import { Search, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { TeacherCourseOption } from '../../types';

interface TeacherCourseSelectorProps {
  courses: TeacherCourseOption[];
  selectedCourseId: string | null;
  onSelectCourse: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: 'all' | 'struggling' | 'in_progress' | 'completed';
  onStatusFilterChange: (status: 'all' | 'struggling' | 'in_progress' | 'completed') => void;
}

export function TeacherCourseSelector({
  courses,
  selectedCourseId,
  onSelectCourse,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: TeacherCourseSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="card-surface p-3 sm:p-4 rounded-xl border border-[var(--border)] space-y-3">
      {/* Top row: Course Selector & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Course Filter Dropdown / Pills */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BookOpen className="w-4 h-4 text-[var(--teacher-primary)] shrink-0" />
          <select
            value={selectedCourseId || ''}
            onChange={(e) => onSelectCourse(e.target.value ? e.target.value : null)}
            className="w-full md:max-w-xs text-xs sm:text-sm py-2 px-3 bg-[var(--color-surface-muted)] border border-[var(--border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)] font-medium"
          >
            <option value="">{t('progress.allCourses')} ({courses.length})</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Student Search */}
        <div className="relative flex-1 min-w-0 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('progress.searchStudentsPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[var(--color-surface-muted)] border border-[var(--border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]"
          />
        </div>
      </div>

      {/* Bottom row: Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onStatusFilterChange('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'all'
              ? 'bg-[var(--teacher-primary)] text-white'
              : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
          }`}
        >
          {t('progress.allStatuses')}
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('struggling')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'struggling'
              ? 'bg-red-600 text-white'
              : 'bg-[var(--color-surface-muted)] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
          }`}
        >
          {t('progress.atRiskStudents')}
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('in_progress')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'in_progress'
              ? 'bg-[var(--warning)] text-white'
              : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
          }`}
        >
          {t('progress.inProgress')}
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('completed')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'completed'
              ? 'bg-[var(--success)] text-white'
              : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
          }`}
        >
          {t('progress.completed')}
        </button>
      </div>
    </div>
  );
}
