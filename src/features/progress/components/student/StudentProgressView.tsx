'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { EmptyState } from '@/components/layout/EmptyState';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { useStudentProgress } from '../../hooks/useStudentProgress';
import { ProgressHeader } from '../ProgressHeader';
import { ProgressOverviewStats, type StatItem } from '../ProgressOverviewStats';
import { StudentProgressFilters } from './StudentProgressFilters';
import { StudentCourseProgressCard } from './StudentCourseProgressCard';
import { StudentInsightsCharts } from './StudentInsightsCharts';
import { StudentQuizAttemptsModal } from './StudentQuizAttemptsModal';

export function StudentProgressView() {
  const { t } = useTranslation();
  const {
    progressData,
    overallStats,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    selectedCourseForModal,
    setSelectedCourseForModal,
    filteredCourses,
    scoreTrendData,
    courseProgressData,
    quizStatusData,
    averageScoreData,
    refetch,
  } = useStudentProgress();

  if (isLoading && progressData.length === 0) {
    return <PageSkeleton />;
  }

  const statItems: StatItem[] = overallStats
    ? [
        { label: t('progress.coursesEnrolled'), value: overallStats.totalCourses, colorClass: 'text-[var(--student-primary)]' },
        { label: t('progress.completed'), value: overallStats.completedCourses, colorClass: 'text-[var(--success)]' },
        { label: t('progress.inProgress'), value: overallStats.inProgressCourses, colorClass: 'text-[var(--warning)]' },
        { label: t('progress.avgProgress'), value: `${overallStats.averageProgress}%`, colorClass: 'text-[var(--student-primary)]' },
        { label: t('progress.quizzesTaken'), value: overallStats.totalQuizzesTaken, colorClass: 'text-[var(--info)]' },
        { label: t('progress.avgQuizScore'), value: `${overallStats.overallAverageScore}%`, colorClass: 'text-[var(--student-accent)]' },
      ]
    : [];

  return (
    <PageWrapper className="space-y-6">
      <ProgressHeader
        title={t('progress.myProgress')}
        description={t('progress.progressDesc')}
        onRefresh={refetch}
        isRefreshing={isLoading}
      />

      {/* Metric Tiles */}
      {statItems.length > 0 && <ProgressOverviewStats stats={statItems} />}

      {/* Analytics Insights Charts */}
      {progressData.length > 0 && (
        <StudentInsightsCharts
          scoreTrendData={scoreTrendData}
          courseProgressData={courseProgressData}
          quizStatusData={quizStatusData}
          averageScoreData={averageScoreData}
        />
      )}

      {/* Course Progress Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {t('progress.courseProgress')} ({filteredCourses.length})
          </h2>
        </div>

        {/* Filters and search toolbar */}
        {progressData.length > 0 && (
          <StudentProgressFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />
        )}

        {/* Course Cards Grid or Empty */}
        {progressData.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t('progress.noProgressData')}
            description={t('dashboard.enrollToTrackProgress')}
            action={
              <Link
                href={ROUTES.student.browse}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--student-primary)] text-white hover:bg-[var(--student-hover)] transition-colors"
              >
                {t('progress.browseCourses')}
              </Link>
            }
          />
        ) : filteredCourses.length === 0 ? (
          <div className="card-surface p-8 rounded-2xl text-center border border-[var(--border)]">
            <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
              {t('progress.noStudentsFound')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-xs font-semibold text-[var(--student-primary)] hover:underline"
            >
              {t('courses.clearFilter')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map((item) => (
              <StudentCourseProgressCard
                key={item.enrollment._id}
                item={item}
                onViewQuizHistory={(selected) => setSelectedCourseForModal(selected)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quiz Attempt History Modal */}
      <StudentQuizAttemptsModal
        isOpen={Boolean(selectedCourseForModal)}
        courseTitle={selectedCourseForModal?.course.title || ''}
        attempts={selectedCourseForModal?.attempts || []}
        onClose={() => setSelectedCourseForModal(null)}
      />
    </PageWrapper>
  );
}
