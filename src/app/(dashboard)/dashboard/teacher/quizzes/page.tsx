// src/app/(dashboard)/dashboard/teacher/quizzes/page.tsx
'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, LayoutGrid, List, HelpCircle } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useTeacherCourses } from '@/lib/react-query/hooks';
import { ApiClientError } from '@/lib/api/http';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Loader } from '@/components/ui/Loader';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import QuizFilters from '@/features/quizzes/components/QuizFilters';
import { toIdString } from '@/lib/id';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { PageWrapper, EmptyState } from '@/components/layout';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';
import TeacherQuizzesStats from './_components/TeacherQuizzesStats';
import TeacherQuizCard from './_components/TeacherQuizCard';
import TeacherQuizTableView from './_components/TeacherQuizTableView';
import { useTeacherQuizzesState } from './_components/useTeacherQuizzesState';

export default function TeacherQuizzesPage() {
  const { status, session } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';

  const { data: coursesData, isLoading: isCoursesLoading } = useTeacherCourses(orgId);
  const courses = useMemo(() => coursesData ?? [], [coursesData]);

  const {
    page, setPage, viewMode, setViewMode,
    searchInput, setSearchInput, statusFilter, setStatusFilter,
    courseFilter, setCourseFilter, sort, setSort,
    deleteTarget, setDeleteTarget, isDeleting,
    quizzes, pagination, showListLoader, totalQuizzes, isFetching, fetchError,
    getCourseTitle, handleTogglePublish, confirmDelete, clearFilters, hasActiveFilters,
  } = useTeacherQuizzesState(courses, orgId);

  useEffect(() => {
    if (status === 'unauthenticated') router.push(ROUTES.login);
  }, [status, router]);

  if (status === 'loading' || isCoursesLoading) return <PageSkeleton />;

  return (
    <PageWrapper>
      <TeacherPageBanner
        icon={HelpCircle}
        eyebrow={t('common.quizzes')}
        title={t('teacherQuizzes.quizManagement')}
        description={t('teacherQuizzes.quizManagementDesc')}
        actions={
          <Link href={ROUTES.teacher.quizCreate} className="teacher-cta-btn w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            <span>{t('teacherQuizzes.createQuiz')}</span>
          </Link>
        }
      />

      {fetchError && (
        <div className="p-4 rounded-xl bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]/25 text-sm font-medium">
          {fetchError instanceof ApiClientError ? fetchError.message : t('errors.errorLoadingQuizzes')}
        </div>
      )}

      <TeacherQuizzesStats quizzes={quizzes} totalQuizzes={totalQuizzes} />

      {courses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
              {t('common.filters')}
            </h2>
            <div className="hidden md:inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]/80">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <FilterPanel>
            <QuizFilters
              searchQuery={searchInput}
              onSearchChange={setSearchInput}
              statusFilter={statusFilter}
              onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
              courseFilter={courseFilter}
              onCourseChange={(v) => { setCourseFilter(v); setPage(1); }}
              courses={courses}
              sort={sort}
              onSortChange={(v) => { setSort(v); setPage(1); }}
              onClear={clearFilters}
            />
          </FilterPanel>
        </div>
      )}

      {showListLoader ? (
        <div className="teacher-panel py-16 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={t('teacherQuizzes.createCourseFirst')}
          action={
            <Link href={ROUTES.teacher.courseCreate} className="teacher-cta-btn">
              <Plus className="w-4 h-4" />
              <span>{t('teacherQuizzes.createCourse')}</span>
            </Link>
          }
        />
      ) : totalQuizzes === 0 && !hasActiveFilters ? (
        <EmptyState
          icon={HelpCircle}
          title={t('teacherQuizzes.noQuizzesYet')}
          description={t('teacherQuizzes.createFirstQuiz')}
          action={
            <Link href={ROUTES.teacher.quizCreate} className="teacher-cta-btn">
              <Plus className="w-4 h-4" />
              <span>{t('teacherQuizzes.createQuiz')}</span>
            </Link>
          }
        />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={t('teacherQuizzes.noQuizzesMatch')}
          description={t('teacherQuizzes.tryAdjustingFilters')}
          action={
            hasActiveFilters ? (
              <Button type="button" onClick={clearFilters} variant="primary" className="min-h-[44px] rounded-xl px-6">
                {t('common.reset')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={`space-y-4 transition-opacity ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className={viewMode === 'table' ? 'block md:hidden' : 'block'}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <TeacherQuizCard
                  key={toIdString(quiz._id)}
                  quiz={quiz}
                  courseTitle={getCourseTitle(quiz.course)}
                  onTogglePublish={handleTogglePublish}
                  onEdit={(id) => router.push(ROUTES.teacher.quizEdit(id))}
                  onDelete={(id, title) => setDeleteTarget({ id, title })}
                />
              ))}
            </div>
          </div>

          {viewMode === 'table' && (
            <div className="hidden md:block">
              <TeacherQuizTableView
                quizzes={quizzes}
                getCourseTitle={getCourseTitle}
                onEdit={(id) => router.push(ROUTES.teacher.quizEdit(id))}
                onTogglePublish={handleTogglePublish}
                onDelete={(id, title) => setDeleteTarget({ id, title })}
              />
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="teacher-panel flex items-center justify-between px-4 py-3">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="secondary"
                size="sm"
                className="min-h-[40px] rounded-xl"
              >
                {t('common.previous')}
              </Button>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] tabular-nums">
                Page <span className="font-bold text-[var(--color-foreground)]">{page}</span> /{' '}
                <span className="font-bold text-[var(--color-foreground)]">{pagination.totalPages}</span>
              </p>
              <Button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                variant="secondary"
                size="sm"
                className="min-h-[40px] rounded-xl"
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={t('teacherQuizzes.deleteQuizTitle')}
        message={
          deleteTarget
            ? `${t('teacherQuizzes.confirmDeleteQuiz')} "${deleteTarget.title}"`
            : t('teacherQuizzes.confirmDeleteQuiz')
        }
        onConfirm={confirmDelete}
        onCancel={() => { if (!isDeleting) setDeleteTarget(null); }}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        isLoading={isDeleting}
      />
    </PageWrapper>
  );
}
