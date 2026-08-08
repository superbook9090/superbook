'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { listCoursesAdmin } from '@/lib/api/courses';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Tooltip from '@/components/ui/Tooltip';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import { usePaginatedQuizzes, type Course } from '@/lib/react-query/hooks';
import { patchQuiz, deleteQuiz } from '@/lib/api/quizzes';
import { ApiClientError } from '@/lib/api/http';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { buildPublishStatusOptions, type PublishStatusFilter } from '@/components/filters/publishStatusOptions';



export default function AdminQuizzesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [filter, setFilter] = useState<PublishStatusFilter>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [courseFilterInitialized, setCourseFilterInitialized] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['courses', 'admin'],
    queryFn: listCoursesAdmin,
    select: (data) => (data.courses ?? []) as Course[],
  });
  const courses = useMemo(() => coursesData ?? [], [coursesData]);

  const { data: paginatedData, isLoading, refetch } = usePaginatedQuizzes({
    page,
    limit,
    search: debouncedSearch,
    status: filter,
    course: courseFilter,
  });

  const quizzes = paginatedData?.quizzes ?? [];
  const pagination = paginatedData?.pagination;

  // Default course filter to the most recently created course
  useEffect(() => {
    if (courseFilterInitialized || courses.length === 0) return;
    const latest = [...courses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    if (latest?._id) {
      setCourseFilter(latest._id);
      setCourseFilterInitialized(true);
    }
  }, [courses, courseFilterInitialized]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter, courseFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('all');
    setCourseFilter('all');
    setPage(1);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
    }
  }, [session, status, router]);

  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
    try {
      await patchQuiz(quizId, { isPublished: !currentStatus });
      setMessage({ type: 'success', text: t('admin.quizUpdated') });
      refetch();
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedUpdateQuiz');
      setMessage({ type: 'error', text });
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      setMessage({ type: 'success', text: t('admin.quizDeleted') });
      setDeleteId(null);
      refetch();
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedDeleteQuiz');
      setMessage({ type: 'error', text });
    }
  };

  // using quizzes directly from backend

  if (isLoading || isCoursesLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className={`p-3 ${theme.activeBg} rounded-xl`}>
          <HelpCircle className={`w-6 h-6 ${theme.text}`} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('common.allQuizzes')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('admin.manageQuizzesDesc')}</p>
        </div>
      </motion.div>

      {/* Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
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
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{pagination?.total ?? quizzes.length}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('admin.totalQuizzes')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm hidden sm:block">
          {/* We only show total in pagination now, since stats depend on all quizzes */}
        </div>
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm hidden sm:block">
          {/* We only show total in pagination now, since stats depend on all quizzes */}
        </div>
      </motion.div>

      {/* Quizzes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {quizzes.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-[var(--card-solid)] rounded-2xl shadow-sm">
            <HelpCircle className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">{t('admin.noQuizzesFound')}</h3>
            <p className="text-[var(--color-muted-foreground)]">{t('admin.adjustSearch')}</p>
          </div>
        ) : (
          quizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[var(--card-solid)] rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-accent)] text-white">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <Badge variant={quiz.isPublished ? 'primary' : 'default'} size="sm">
                    {quiz.isPublished ? t('common.published') : t('common.draft')}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2 line-clamp-2">
                  {quiz.title}
                </h3>

                {/* Description */}
                <p className="text-[var(--color-muted-foreground)] text-sm mb-4 line-clamp-2">
                  {quiz.description || t('courses.noDescription')}
                </p>

                {/* Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {quiz.course.title}
                  </div>
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    {t('admin.questions', { count: quiz.questionCount ?? 0 })}
                  </div>
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(quiz.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                    className="flex-1 flex items-center justify-center min-h-[44px] sm:min-h-0 px-3 py-2 bg-[var(--color-surface-muted)] text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)]/80 transition-colors text-sm"
                  >
                    {quiz.isPublished ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        {t('admin.unpublish')}
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        {t('admin.publish')}
                      </>
                    )}
                  </button>
                  <Tooltip label={t('common.delete')}>
                    <button
                      onClick={() => setDeleteId(quiz._id)}
                      aria-label={t('common.delete')}
                      className="px-3 py-2 min-h-[44px] sm:min-h-0 bg-[var(--error-light)] text-[var(--error)] rounded-lg hover:bg-[var(--error-light)]/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteId === quiz._id && (
                <div className="px-6 pb-6">
                  <div className="bg-[var(--error-light)] border border-[var(--error)] rounded-xl p-4">
                    <p className="text-sm text-[var(--error)] mb-3">
                      {t('admin.deleteQuizConfirm')}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className={`flex-1 min-h-[44px] sm:min-h-0 px-3 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-lg hover:opacity-90 transition-colors text-sm`}
                      >
                        {t('common.delete')}
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="flex-1 min-h-[44px] sm:min-h-0 px-3 py-2 bg-[var(--card-solid)] text-[var(--error)] border border-[var(--error)] rounded-lg hover:bg-[var(--error-light)] transition-colors text-sm"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 mt-4 bg-[var(--card-solid)] rounded-2xl shadow-sm">
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
    </div>
  );
}
