'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { patchQuiz, deleteQuiz } from '@/lib/api/quizzes';
import { invalidateAfterQuizChange, usePaginatedQuizzes, type Course, type Quiz } from '@/lib/react-query/hooks';
import { ApiClientError } from '@/lib/api/http';
import { useAlert } from '@/components/ui/AlertContainer';
import { type QuizSortOption, type QuizStatusFilter } from '@/features/quizzes/utils/quizListFilters';
import { toIdString } from '@/lib/id';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export function useTeacherQuizzesState(courses: Course[], orgId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { addAlert } = useAlert();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<QuizStatusFilter>('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [courseFilterInitialized, setCourseFilterInitialized] = useState(false);
  const [sort, setSort] = useState<QuizSortOption>('newest');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: paginatedData, isLoading: isQuizzesLoading, isFetching, error: fetchError } = usePaginatedQuizzes({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
    course: courseFilter,
    sort,
    instructor: 'self',
  });

  const quizzes = useMemo(() => paginatedData?.quizzes ?? [], [paginatedData?.quizzes]);
  const pagination = paginatedData?.pagination;
  const showListLoader = isQuizzesLoading && paginatedData === undefined;
  const totalQuizzes = pagination?.total ?? 0;

  useEffect(() => {
    if (courseFilterInitialized || courses.length === 0) return;
    const latest = [...courses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (latest?._id) {
      setCourseFilter(latest._id);
      setCourseFilterInitialized(true);
    }
  }, [courses, courseFilterInitialized]);

  useEffect(() => { setPage(1); }, [searchTerm]);
  useEffect(() => {
    if (!pagination) return;
    if (pagination.totalPages > 0 && page > pagination.totalPages) setPage(pagination.totalPages);
  }, [pagination, page]);

  const getCourseId = useCallback((course: Quiz['course'] | string): string => {
    return typeof course === 'object' && course !== null && '_id' in course ? toIdString(course._id) : toIdString(course);
  }, []);

  const getCourseTitle = useCallback((course: Quiz['course'] | string): string => {
    if (typeof course === 'object' && course !== null && 'title' in course) return course.title;
    if (typeof course === 'string') return courses.find((c) => c._id === course)?.title ?? t('teacherQuizzes.unknownCourse');
    return t('teacherQuizzes.unknownCourse');
  }, [courses, t]);

  const handleTogglePublish = useCallback(async (quiz: Quiz) => {
    const quizId = toIdString(quiz._id);
    try {
      await patchQuiz(quizId, { isPublished: !quiz.isPublished });
      addAlert({ type: 'success', message: t('teacherQuizzes.quizUpdated') });
      await invalidateAfterQuizChange(queryClient, getCourseId(quiz.course), orgId);
    } catch (err) {
      addAlert({ type: 'error', message: err instanceof ApiClientError ? err.message : t('teacherQuizzes.errorUpdateQuiz') });
    }
  }, [queryClient, getCourseId, orgId, t, addAlert]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const quiz = quizzes.find((q) => toIdString(q._id) === deleteTarget.id);
    try {
      await deleteQuiz(deleteTarget.id);
      addAlert({ type: 'success', message: t('teacherQuizzes.quizDeleted') });
      await invalidateAfterQuizChange(queryClient, quiz ? getCourseId(quiz.course) : '', orgId);
      setDeleteTarget(null);
    } catch (err) {
      addAlert({ type: 'error', message: err instanceof ApiClientError ? err.message : t('teacherQuizzes.errorDeleteQuiz') });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, quizzes, queryClient, getCourseId, orgId, t, addAlert]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setStatusFilter('all');
    setCourseFilter('all');
    setSort('newest');
    setPage(1);
  }, []);

  const hasActiveFilters = Boolean(searchInput.trim()) || statusFilter !== 'all' || courseFilter !== 'all' || sort !== 'newest';

  return {
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
  };
}
