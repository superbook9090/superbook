// src/app/(dashboard)/dashboard/teacher/quizzes/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { patchQuiz, deleteQuiz } from '@/lib/api/quizzes';
import { invalidateAfterQuizChange, usePaginatedQuizzes, useTeacherCourses, type Quiz } from '@/lib/react-query/hooks';
import { ApiClientError } from '@/lib/api/http';
import Alert from '@/components/ui/Alert';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import QuizFilters from '@/features/quizzes/components/QuizFilters';
import {
  type QuizSortOption,
  type QuizStatusFilter,
} from '@/features/quizzes/utils/quizListFilters';
import { toIdString } from '@/lib/id';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function TeacherQuizzesPage() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const queryClient = useQueryClient();
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data: coursesData } = useTeacherCourses(orgId);
  const courses = useMemo(() => coursesData ?? [], [coursesData]);

  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<QuizStatusFilter>('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sort, setSort] = useState<QuizSortOption>('newest');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: paginatedData, isLoading, error: fetchError } = usePaginatedQuizzes({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
    course: courseFilter,
    sort,
  });

  const quizzes = useMemo(() => paginatedData?.quizzes ?? [], [paginatedData?.quizzes]);
  const pagination = paginatedData?.pagination;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, courseFilter, sort]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setStatusFilter('all');
    setCourseFilter('all');
    setSort('newest');
    setPage(1);
  }, []);

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    statusFilter !== 'all' ||
    courseFilter !== 'all' ||
    sort !== 'newest';

  // Memoized helper to safely get course title
  const getCourseId = useCallback((course: Quiz['course'] | string): string => {
    if (typeof course === 'object' && course !== null && '_id' in course) {
      return toIdString(course._id);
    }
    return toIdString(course);
  }, []);

  const getCourseTitle = useCallback(
    (course: Quiz['course'] | string): string => {
      if (typeof course === 'object' && course !== null && 'title' in course) {
        return course.title;
      }
      if (typeof course === 'string') {
        return courses.find((c) => c._id === course)?.title ?? t('teacherQuizzes.unknownCourse');
      }
      return t('teacherQuizzes.unknownCourse');
    },
    [courses, t]
  );

  // using quizzes directly from backend

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
    }
  }, [status, router]);

  const error =
    fetchError instanceof ApiClientError
      ? fetchError.message
      : fetchError
        ? t('errors.errorLoadingQuizzes')
        : '';

  const handleTogglePublish = useCallback(async (quiz: Quiz) => {
    const quizId = toIdString(quiz._id);
    try {
      await patchQuiz(quizId, { isPublished: !quiz.isPublished });
      await invalidateAfterQuizChange(queryClient, getCourseId(quiz.course), orgId);
    } catch (err) {
      setAlertState({
        type: 'error',
        message:
          err instanceof ApiClientError ? err.message : t('teacherQuizzes.errorUpdateQuiz'),
      });
    }
  }, [queryClient, getCourseId, orgId, t]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const quiz = quizzes.find((q) => toIdString(q._id) === deleteTarget.id);
    try {
      await deleteQuiz(deleteTarget.id);
      await invalidateAfterQuizChange(queryClient, quiz ? getCourseId(quiz.course) : '', orgId);
      setDeleteTarget(null);
    } catch (err) {
      setAlertState({
        type: 'error',
        message:
          err instanceof ApiClientError ? err.message : t('teacherQuizzes.errorDeleteQuiz'),
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, quizzes, queryClient, getCourseId, orgId, t]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] truncate">{t('teacherQuizzes.quizManagement')}</h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--color-muted-foreground)]">{t('teacherQuizzes.quizManagementDesc')}</p>
        </div>
        <Link
          href={ROUTES.teacher.quizCreate}
          className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
        >
          {t('teacherQuizzes.createQuiz')}
        </Link>
      </div>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {error ? (
        <div className="bg-[var(--error-light)] border-l-4 border-[var(--error)] p-3 sm:p-4 rounded-r-lg">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      ) : null}

      {courses.length > 0 && quizzes.length > 0 && (
        <FilterPanel>
          <QuizFilters
            searchQuery={searchInput}
            onSearchChange={setSearchInput}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            courseFilter={courseFilter}
            onCourseChange={setCourseFilter}
            courses={courses}
            sort={sort}
            onSortChange={setSort}
            onClear={clearFilters}
          />
        </FilterPanel>
      )}

      <div>
        {courses.length === 0 ? (
          <div className="bg-[var(--card-solid)] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-[var(--color-muted-foreground)] mb-4">{t('teacherQuizzes.createCourseFirst')}</p>
              <Link
                href={ROUTES.teacher.courseCreate}
                className={`inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:px-4 sm:py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 touch-manipulation`}
              >
                {t('teacherQuizzes.createCourse')}
              </Link>
            </div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-[var(--card-solid)] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-[var(--color-muted-foreground)] mb-4">{t('teacherQuizzes.noQuizzesYet')}</p>
              <Link
                href={ROUTES.teacher.quizCreate}
                className={`inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:px-4 sm:py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 touch-manipulation`}
              >
                {t('teacherQuizzes.createFirstQuiz')}
              </Link>
            </div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-[var(--card-solid)] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-[var(--color-muted-foreground)] mb-2">{t('teacherQuizzes.noQuizzesMatch')}</p>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-4">{t('teacherQuizzes.tryAdjustingFilters')}</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`inline-flex items-center justify-center min-h-[44px] px-4 py-3 text-sm font-medium rounded-lg text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 touch-manipulation`}
                >
                  {t('common.reset')}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {quizzes.map((quiz) => {
                const quizId = toIdString(quiz._id);
                return (
                <div key={quizId} className="bg-[var(--card-solid)] shadow rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[var(--color-foreground)] truncate">{quiz.title}</h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">{getCourseTitle(quiz.course)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                        quiz.isPublished
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                      }`}
                    >
                      {quiz.isPublished ? t('teacherQuizzes.published') : t('teacherQuizzes.draft')}
                    </span>
                  </div>

                  {quiz.description && (
                    <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2">{quiz.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)]">
                    <span>{quiz.questionCount ?? 0} {t('teacherQuizzes.questions')}</span>
                    <span>{quiz.timeLimit} {t('teacherQuizzes.min')}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => router.push(ROUTES.teacher.quizEdit(quizId))}
                      className="flex-1 min-h-[44px] sm:min-h-0 px-3 py-2 text-sm font-medium text-[var(--teacher-primary)] bg-[var(--teacher-soft)] rounded-lg hover:bg-[var(--teacher-border)] transition-colors touch-manipulation"
                    >
                      {t('teacherQuizzes.edit')}
                    </button>
                    <button
                      onClick={() => handleTogglePublish(quiz)}
                      className={`flex-1 min-h-[44px] sm:min-h-0 px-3 py-2 text-sm font-medium ${theme.text} ${theme.activeBg} rounded-lg hover:opacity-80 touch-manipulation`}
                    >
                      {quiz.isPublished ? t('teacherQuizzes.unpublish') : t('teacherQuizzes.publish')}
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: quizId, title: quiz.title })}
                      className="min-h-[44px] sm:min-h-0 px-3 py-2 text-sm font-medium text-[var(--error)] bg-[var(--error-light)] rounded-lg hover:bg-[var(--error)]/20 touch-manipulation"
                    >
                      {t('teacherQuizzes.delete')}
                    </button>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-[var(--card-solid)] shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableQuiz')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableCourse')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableQuestions')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableTime')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableStatus')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('teacherQuizzes.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--card-solid)] divide-y divide-[var(--border)]">
                  {quizzes.map((quiz) => {
                    const quizId = toIdString(quiz._id);
                    return (
                    <tr key={quizId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--color-foreground)]">{quiz.title}</div>
                        {quiz.description && (
                          <div className="text-sm text-[var(--color-muted-foreground)] truncate max-w-xs">{quiz.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                        {getCourseTitle(quiz.course)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                        {quiz.questionCount ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                        {quiz.timeLimit} {t('teacherQuizzes.min')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            quiz.isPublished
                              ? 'bg-[var(--success-light)] text-[var(--success)]'
                              : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                          }`}
                        >
                          {quiz.isPublished ? t('teacherQuizzes.published') : t('teacherQuizzes.draft')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => router.push(ROUTES.teacher.quizEdit(quizId))}
                          className="text-[var(--teacher-primary)] hover:text-[var(--teacher-primary)]/80 mr-4"
                        >
                          {t('teacherQuizzes.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(quiz)}
                          className="text-[var(--teacher-primary)] hover:text-[var(--teacher-primary)]/80 mr-4"
                        >
                          {quiz.isPublished ? t('teacherQuizzes.unpublish') : t('teacherQuizzes.publish')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: quizId, title: quiz.title })}
                          className="text-[var(--error)] hover:text-[var(--error)]/80"
                        >
                          {t('teacherQuizzes.delete')}
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-[var(--color-foreground)] bg-[var(--card-solid)] border border-[var(--border)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-[var(--color-foreground)] bg-[var(--card-solid)] border border-[var(--border)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next')}
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-[var(--color-muted-foreground)] ring-1 ring-inset ring-[var(--border)] hover:bg-[var(--color-surface-muted)] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-[var(--color-muted-foreground)] ring-1 ring-inset ring-[var(--border)] hover:bg-[var(--color-surface-muted)] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={t('teacherQuizzes.deleteQuizTitle')}
        message={
          deleteTarget
            ? `${t('teacherQuizzes.confirmDeleteQuiz')} "${deleteTarget.title}"`
            : t('teacherQuizzes.confirmDeleteQuiz')
        }
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
