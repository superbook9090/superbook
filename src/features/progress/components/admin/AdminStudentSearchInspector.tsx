'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { TeacherStudentRosterTable } from '../teacher/TeacherStudentRosterTable';
import type { TeacherStudentRow } from '../../types';

interface AdminStudentSearchInspectorProps {
  students: TeacherStudentRow[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onInspect: (studentId: string, studentName: string) => void;
}

export function AdminStudentSearchInspector({
  students,
  searchQuery,
  onSearchChange,
  onInspect,
}: AdminStudentSearchInspectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="card-surface p-3 sm:p-4 rounded-xl border border-[var(--border)] flex items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('progress.searchStudentsPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[var(--color-surface-muted)] border border-[var(--border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
          />
        </div>
      </div>

      {/* Roster Table */}
      <TeacherStudentRosterTable
        students={students}
        onInspect={onInspect}
      />
    </div>
  );
}
