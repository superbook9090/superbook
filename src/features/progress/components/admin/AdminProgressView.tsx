'use client';

import React from 'react';
import { RotateCw, TrendingUp } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';
import { useAdminProgress } from '../../hooks/useAdminProgress';
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
    <PageWrapper>
      <AdminPageBanner
        icon={TrendingUp}
        eyebrow={t('progress.adminProgress')}
        title={t('progress.adminProgress')}
        description={t('progress.adminProgressDesc')}
        actions={
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            className="teacher-pill-btn min-h-[44px] px-4 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('progress.refresh')}</span>
          </button>
        }
      />

      <AdminPlatformProgressStats stats={overallStats} />

      <AdminCourseHealthList courseHealth={courseHealth} />

      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)]">
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
