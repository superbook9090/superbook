'use client';

import React from 'react';
import { Search, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Dropdown } from '@/components/ui/Dropdown';
import { TeacherTabs } from '@/features/teacher/components/TeacherTabs';
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
    <div className="teacher-panel p-3.5 sm:p-4 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="w-full md:max-w-xs">
          <Dropdown
            id="teacher-progress-course"
            startIcon={<BookOpen className="w-4 h-4" />}
            value={selectedCourseId || ''}
            onChange={(val) => onSelectCourse(val ? val : null)}
            options={[
              { value: '', label: `${t('progress.allCourses')} (${courses.length})` },
              ...courses.map((c) => ({ value: c._id, label: c.title })),
            ]}
          />
        </div>

        <div className="relative flex-1 min-w-0 md:max-w-sm group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] group-focus-within:text-[var(--teacher-primary)] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('progress.searchStudentsPlaceholder')}
            className="w-full min-h-[42px] pl-10 pr-4 py-2 text-sm bg-[var(--card-solid)] border border-[var(--border)] rounded-xl text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/25 focus:border-[var(--teacher-primary)] transition-all"
          />
        </div>
      </div>

      <div className="pt-2.5 border-t border-[var(--border)]/70">
        <TeacherTabs
          activeTab={statusFilter}
          onChange={onStatusFilterChange}
          tabs={[
            { id: 'all', label: t('progress.allStatuses') },
            { id: 'struggling', label: t('progress.atRiskStudents'), tone: 'danger' },
            { id: 'in_progress', label: t('progress.inProgress'), tone: 'warning' },
            { id: 'completed', label: t('progress.completed'), tone: 'success' },
          ]}
        />
      </div>
    </div>
  );
}
