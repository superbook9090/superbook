// src/app/(dashboard)/dashboard/admin/quizzes/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { buildPublishStatusOptions, type PublishStatusFilter } from '@/components/filters/publishStatusOptions';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';

import { useAdminQuizzesState } from './_hooks/useAdminQuizzesState';
import { AdminQuizzesHero } from './_components/AdminQuizzesHero';
import { AdminQuizzesStats } from './_components/AdminQuizzesStats';
import { AdminQuizCard } from './_components/AdminQuizCard';
import { AdminQuizTableView } from './_components/AdminQuizTableView';

export default function AdminQuizzesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    courseFilter,
    setCourseFilter,
    viewMode,
    setViewMode,
    deleteId,
    setDeleteId,
    courses,
    isCoursesLoading,
    quizzes,
    pagination,
    isLoading,
    clearFilters,
    handleTogglePublish,
    handleDelete,
  } = useAdminQuizzesState();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
    }
  }, [session, status, router]);

  if (isLoading || isCoursesLoading || status === 'loading') {
    return <PageSkeleton />;
  }

  const getCourseTitle = (courseId?: string) => {
    if (!courseId) return undefined;
    return courses.find((c) => c._id === courseId)?.title;
  };

  return (
    <PageWrapper className="space-y-6">
      {/* Hero Banner Header */}
      <AdminQuizzesHero viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* KPI Stats Overview */}
      <AdminQuizzesStats
        quizzes={quizzes}
        totalQuizzes={pagination?.total}
        totalCourses={courses.length}
      />

      {/* Filter Panel */}
      <FilterPanel>
        <DashboardListFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={clearFilters}
          searchPlaceholder={t('admin.searchQuizzes')}
          segmentedFilter={{
            value: filter,
            onChange: (id) => setFilter(id as PublishStatusFilter),
            neutralValue: 'all',
            options: buildPublishStatusOptions({
              all: t('admin.allQuizzes'),
              published: t('common.published'),
              draft: t('common.draft'),
            }),
          }}
          chipGroups={
            courses.length > 0
              ? [
                  {
                    label: t('teacherQuizzes.tableCourse'),
                    icon: <BookOpen className="w-3.5 h-3.5" aria-hidden />,
                    value: courseFilter,
                    onChange: (id) => setCourseFilter(id),
                    options: [
                      { id: 'all', label: t('teacherQuizzes.allCourses') },
                      ...courses.map((course) => ({ id: course._id, label: course.title })),
                    ],
                    neutralValue: 'all',
                    minOptions: 2,
                  },
                ]
              : undefined
          }
        />
      </FilterPanel>

      {/* Quizzes List (Grid or Table) */}
      {quizzes.length === 0 ? (
        <EmptyState
          title={t('admin.noQuizzesFound') || 'No quizzes found'}
          description={t('admin.adjustSearch') || 'Try adjusting your search criteria or course filters.'}
          action={
            <Button onClick={clearFilters} variant="secondary">
              {t('common.reset') || 'Reset Filters'}
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <ResponsiveGrid variant="cards">
          {quizzes.map((quiz, index) => (
            <AdminQuizCard
              key={quiz._id}
              quiz={quiz}
              index={index}
              courseTitle={getCourseTitle(quiz.course?._id) ?? quiz.course?.title}
              onTogglePublish={handleTogglePublish}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </ResponsiveGrid>
      ) : (
        <AdminQuizTableView
          quizzes={quizzes}
          courses={courses}
          onTogglePublish={handleTogglePublish}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center antigravity-glass border border-[var(--border)] rounded-2xl px-5 py-3 shadow-md"
        >
          <p className="text-xs sm:text-sm font-medium text-[var(--color-muted-foreground)]">
            {t('admin.showing').replace('{current}', String(quizzes.length)).replace('{total}', String(pagination.total))}
          </p>
          <div className="flex items-center gap-2">
            <Tooltip label={t('common.previous')}>
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label={t('common.previous')}
                variant="secondary"
                size="sm"
                className="p-2 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Tooltip>
            <span className="px-3 text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
              {t('admin.page').replace('{current}', String(page)).replace('{total}', String(pagination.totalPages))}
            </span>
            <Tooltip label={t('common.next')}>
              <Button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                aria-label={t('common.next')}
                variant="secondary"
                size="sm"
                className="p-2 rounded-xl"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title={t('admin.deleteQuiz') || 'Delete Quiz'}
        message={t('admin.deleteQuizConfirm') || 'Are you sure you want to delete this quiz? This action cannot be undone.'}
        confirmText={t('common.delete') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        type="danger"
      />
    </PageWrapper>
  );
}
