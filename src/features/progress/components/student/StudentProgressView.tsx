'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, RotateCw, TrendingUp } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { EmptyState } from '@/components/layout/EmptyState';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { StudentPageBanner } from '@/features/student/components/StudentPageBanner';
import { useStudentProgress } from '../../hooks/useStudentProgress';
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
    <PageWrapper>
      <StudentPageBanner
        icon={TrendingUp}
        eyebrow={t('common.progress')}
        title={t('progress.myProgress')}
        description={t('progress.progressDesc')}
        actions={
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            className="student-pill-btn w-full sm:w-auto disabled:opacity-60"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('progress.refresh')}</span>
          </button>
        }
      />

      {statItems.length > 0 && <ProgressOverviewStats stats={statItems} />}

      {progressData.length > 0 && (
        <StudentInsightsCharts
          scoreTrendData={scoreTrendData}
          courseProgressData={courseProgressData}
          quizStatusData={quizStatusData}
          averageScoreData={averageScoreData}
        />
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-foreground)]">
            {t('progress.courseProgress')} ({filteredCourses.length})
          </h2>
        </div>

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

        {progressData.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t('progress.noProgressData')}
            description={t('dashboard.enrollToTrackProgress')}
            action={
              <Link href={ROUTES.student.browse} className="student-cta-btn">
                {t('progress.browseCourses')}
              </Link>
            }
          />
        ) : filteredCourses.length === 0 ? (
          <div className="student-panel p-8 text-center">
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

      <StudentQuizAttemptsModal
        isOpen={Boolean(selectedCourseForModal)}
        courseTitle={selectedCourseForModal?.course.title || ''}
        attempts={selectedCourseForModal?.attempts || []}
        onClose={() => setSelectedCourseForModal(null)}
      />
    </PageWrapper>
  );
}
