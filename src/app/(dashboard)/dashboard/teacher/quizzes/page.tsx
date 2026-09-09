// src/app/(dashboard)/dashboard/teacher/quizzes/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { PageWrapper } from '@/components/layout';
import { Plus, LayoutGrid, List, HelpCircle } from 'lucide-react';
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
    page,
    setPage,
    viewMode,
    setViewMode,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    courseFilter,
    setCourseFilter,
    sort,
    setSort,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    quizzes,
    pagination,
    showListLoader,
    totalQuizzes,
    isFetching,
    fetchError,
    getCourseTitle,
    handleTogglePublish,
    confirmDelete,
    clearFilters,
    hasActiveFilters,
  } = useTeacherQuizzesState(courses, orgId);

  useEffect(() => {
    if (status === 'unauthenticated') router.push(ROUTES.login);
  }, [status, router]);

  if (status === 'loading' || isCoursesLoading) return <PageSkeleton />;

  return (
    <PageWrapper className="space-y-6">
      {/* Hero Banner Header */}
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('teacherQuizzes.quizManagement')}</span>
          </div>
          <h1 className="heading-xl">{t('teacherQuizzes.quizManagement')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">{t('teacherQuizzes.quizManagementDesc')}</p>
        </div>

        <Link
          href={ROUTES.teacher.quizCreate}
          className="btn-premium inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('teacherQuizzes.createQuiz')}</span>
        </Link>
      </div>

      {fetchError && (
        <div className="p-4 rounded-2xl bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20">
          {fetchError instanceof ApiClientError ? fetchError.message : t('errors.errorLoadingQuizzes')}
        </div>
      )}

      {/* KPI Stats Overview */}
      <TeacherQuizzesStats quizzes={quizzes} totalQuizzes={totalQuizzes} />

      {/* Filters & View Switcher */}
      {courses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">{t('common.filters')}</h2>
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]' : 'text-[var(--color-muted-foreground)]'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]' : 'text-[var(--color-muted-foreground)]'}`}
                title="Table View"
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

      {/* Content Rendering */}
      {showListLoader ? (
        <div className="bg-[var(--card-solid)] antigravity-glass rounded-3xl py-16 flex justify-center border border-[var(--border)]">
          <Loader size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[var(--card-solid)] antigravity-glass rounded-3xl border border-dashed border-[var(--border)]">
          <p className="text-sm text-[var(--color-muted-foreground)] mb-4">{t('teacherQuizzes.createCourseFirst')}</p>
          <Link href={ROUTES.teacher.courseCreate} className="btn-premium inline-flex items-center gap-2 min-h-[44px]">
            <Plus className="w-4 h-4" />
            <span>{t('teacherQuizzes.createCourse')}</span>
          </Link>
        </div>
      ) : totalQuizzes === 0 && !hasActiveFilters ? (
        <div className="text-center py-16 px-4 bg-[var(--card-solid)] antigravity-glass rounded-3xl border border-dashed border-[var(--border)]">
          <HelpCircle className="w-14 h-14 text-[var(--color-muted-foreground)] mx-auto mb-3 opacity-30" />
          <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-1">{t('teacherQuizzes.noQuizzesYet')}</h3>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-5">{t('teacherQuizzes.createFirstQuiz')}</p>
          <Link href={ROUTES.teacher.quizCreate} className="btn-premium inline-flex items-center gap-2 min-h-[44px]">
            <Plus className="w-4 h-4" />
            <span>{t('teacherQuizzes.createQuiz')}</span>
          </Link>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[var(--card-solid)] antigravity-glass rounded-3xl border border-dashed border-[var(--border)]">
          <p className="text-sm font-bold text-[var(--color-foreground)] mb-1">{t('teacherQuizzes.noQuizzesMatch')}</p>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-4">{t('teacherQuizzes.tryAdjustingFilters')}</p>
          {hasActiveFilters && (
            <Button type="button" onClick={clearFilters} variant="primary" className="min-h-[44px]">
              {t('common.reset')}
            </Button>
          )}
        </div>
      ) : (
        <div className={`space-y-4 ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}>
          {/* Mobile & Grid View */}
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

          {/* Desktop Table View */}
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

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 mt-4">
              <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} variant="secondary" size="sm" className="min-h-[44px]">
                {t('common.previous')}
              </Button>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                Page <span className="font-bold text-[var(--color-foreground)]">{page}</span> of <span className="font-bold text-[var(--color-foreground)]">{pagination.totalPages}</span>
              </p>
              <Button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} variant="secondary" size="sm" className="min-h-[44px]">
                {t('common.next')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={t('teacherQuizzes.deleteQuizTitle')}
        message={deleteTarget ? `${t('teacherQuizzes.confirmDeleteQuiz')} "${deleteTarget.title}"` : t('teacherQuizzes.confirmDeleteQuiz')}
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
