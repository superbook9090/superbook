'use client';

import React from 'react';
import { RotateCw, TrendingUp } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';
import { useTeacherProgress } from '../../hooks/useTeacherProgress';
import { TeacherCohortStats } from './TeacherCohortStats';
import { TeacherCourseSelector } from './TeacherCourseSelector';
import { TeacherStudentRosterTable } from './TeacherStudentRosterTable';
import { TeacherStudentDetailModal } from './TeacherStudentDetailModal';

export function TeacherProgressView() {
  const { t } = useTranslation();
  const {
    courses,
    students,
    rawStudentsCount,
    overallStats,
    selectedCourseId,
    setSelectedCourseId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isLoading,
    drilldownStudent,
    drilldownCourses,
    drilldownStats,
    isDrilldownLoading,
    inspectStudent,
    closeDrilldown,
    refetch,
  } = useTeacherProgress();

  if (isLoading && rawStudentsCount === 0 && !overallStats) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <TeacherPageBanner
        icon={TrendingUp}
        eyebrow={t('common.progress')}
        title={t('progress.teacherProgress')}
        description={t('progress.teacherProgressDesc')}
        actions={
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            className="teacher-pill-btn w-full sm:w-auto disabled:opacity-60"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('progress.refresh')}</span>
          </button>
        }
      />

      <TeacherCohortStats stats={overallStats} />

      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-foreground)]">
            {t('progress.studentRoster')} ({students.length})
          </h2>
        </div>

        <TeacherCourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourse={setSelectedCourseId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <TeacherStudentRosterTable students={students} onInspect={inspectStudent} />
      </section>

      <TeacherStudentDetailModal
        isOpen={Boolean(drilldownStudent)}
        studentName={drilldownStudent?.name || ''}
        courses={drilldownCourses}
        stats={drilldownStats}
        isLoading={isDrilldownLoading}
        onClose={closeDrilldown}
      />
    </PageWrapper>
  );
}
