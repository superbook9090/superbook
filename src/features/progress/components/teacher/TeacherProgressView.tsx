'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useTeacherProgress } from '../../hooks/useTeacherProgress';
import { ProgressHeader } from '../ProgressHeader';
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
    <PageWrapper className="space-y-6">
      <ProgressHeader
        title={t('progress.teacherProgress')}
        description={t('progress.teacherProgressDesc')}
        onRefresh={refetch}
        isRefreshing={isLoading}
      />

      {/* Cohort Stats Strip */}
      <TeacherCohortStats stats={overallStats} />

      {/* Roster & Course Filter Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {t('progress.studentRoster')} ({students.length})
          </h2>
        </div>

        {/* Filter and selector toolbar */}
        <TeacherCourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourse={setSelectedCourseId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Roster Table / Mobile Cards */}
        <TeacherStudentRosterTable
          students={students}
          onInspect={inspectStudent}
        />
      </section>

      {/* Student Progress Drilldown Modal */}
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
