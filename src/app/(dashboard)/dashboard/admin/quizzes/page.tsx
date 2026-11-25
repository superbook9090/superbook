// src/app/(dashboard)/dashboard/admin/quizzes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin } from '@/lib/roles';
import InactiveQuizzesCleanupModal from '@/components/admin/InactiveQuizzesCleanupModal';
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
  const { addAlert } = useAlert();
  const isSuperAdminUser = isSuperAdmin(session?.user?.role);
  const [showCleanupModal, setShowCleanupModal] = useState(false);

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
    refetch,
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
    <PageWrapper>
      <AdminQuizzesHero
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isSuperAdmin={isSuperAdminUser}
        onOpenCleanupModal={() => setShowCleanupModal(true)}
      />

      <AdminQuizzesStats
        quizzes={quizzes}
        totalQuizzes={pagination?.total}
        totalCourses={courses.length}
      />

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

      {quizzes.length === 0 ? (
        <EmptyState
          title={t('admin.noQuizzesFound')}
          description={t('admin.adjustSearch')}
          action={
            <Button onClick={clearFilters} variant="secondary">
              {t('common.reset')}
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <ResponsiveGrid variant="dense">
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

      {pagination && pagination.totalPages > 1 && (
        <div className="teacher-panel flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3">
          <p className="text-xs sm:text-sm font-medium text-[var(--color-muted-foreground)] tabular-nums">
            {t('admin.showing')
              .replace('{current}', String(quizzes.length))
              .replace('{total}', String(pagination.total))}
          </p>
          <div className="flex items-center gap-1.5">
            <Tooltip label={t('common.previous')}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label={t('common.previous')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </Tooltip>
            <span className="px-3 text-xs sm:text-sm font-bold text-[var(--color-foreground)] tabular-nums">
              {t('admin.page')
                .replace('{current}', String(page))
                .replace('{total}', String(pagination.totalPages))}
            </span>
            <Tooltip label={t('common.next')}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                aria-label={t('common.next')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title={t('admin.deleteQuiz')}
        message={t('admin.deleteQuizConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        type="danger"
      />

      {isSuperAdminUser && (
        <InactiveQuizzesCleanupModal
          isOpen={showCleanupModal}
          onClose={() => setShowCleanupModal(false)}
          onCompleted={(message) => {
            addAlert({ type: 'success', message });
            void refetch();
          }}
        />
      )}
    </PageWrapper>
  );
}
