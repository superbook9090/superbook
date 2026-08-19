'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useAdminProgress } from '../../hooks/useAdminProgress';
import { ProgressHeader } from '../ProgressHeader';
import { AdminPlatformProgressStats } from './AdminPlatformProgressStats';
import { AdminCourseHealthList } from './AdminCourseHealthList';
import { AdminStudentSearchInspector } from './AdminStudentSearchInspector';
import { TeacherStudentDetailModal } from '../teacher/TeacherStudentDetailModal';

export function AdminProgressView() {
  const { t } = useTranslation();
  const {
    overallStats,
    courseHealth,
    students,
    searchQuery,
    setSearchQuery,
    isLoading,
    drilldownStudent,
    drilldownCourses,
    drilldownStats,
    isDrilldownLoading,
    inspectStudent,
    closeDrilldown,
    refetch,
  } = useAdminProgress();

  if (isLoading && !overallStats && students.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper className="space-y-6">
      <ProgressHeader
        title={t('progress.adminProgress')}
        description={t('progress.adminProgressDesc')}
        onRefresh={refetch}
        isRefreshing={isLoading}
      />

      {/* Platform Progress Stats */}
      <AdminPlatformProgressStats stats={overallStats} />

      {/* Course Completion Health */}
      <AdminCourseHealthList courseHealth={courseHealth} />

      {/* Student Search & Roster */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {t('progress.studentRoster')} ({students.length})
          </h2>
        </div>

        <AdminStudentSearchInspector
          students={students}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onInspect={inspectStudent}
        />
      </section>

      {/* Student Detail Modal */}
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
