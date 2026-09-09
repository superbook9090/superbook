'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCoursesAdmin } from '@/lib/api/courses';
import { usePaginatedQuizzes, type Course } from '@/lib/react-query/hooks';
import { patchQuiz, deleteQuiz } from '@/lib/api/quizzes';
import { ApiClientError } from '@/lib/api/http';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAlert } from '@/components/ui/AlertContainer';
import { useTranslation } from '@/hooks/useTranslation';
import type { PublishStatusFilter } from '@/components/filters/publishStatusOptions';

const PAGE_SIZE = 12;

export function useAdminQuizzesState() {
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [filter, setFilter] = useState<PublishStatusFilter>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [courseFilterInitialized, setCourseFilterInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['courses', 'admin'],
    queryFn: listCoursesAdmin,
    select: (data) => (data.courses ?? []) as Course[],
  });
  const courses = useMemo(() => coursesData ?? [], [coursesData]);

  const { data: paginatedData, isLoading, refetch } = usePaginatedQuizzes({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    status: filter,
    course: courseFilter,
  });

  const quizzes = paginatedData?.quizzes ?? [];
  const pagination = paginatedData?.pagination;

  // Initialize course filter with most recent course if available
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

  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
    try {
      await patchQuiz(quizId, { isPublished: !currentStatus });
      addAlert({ type: 'success', message: t('admin.quizUpdated') });
      refetch();
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedUpdateQuiz');
      addAlert({ type: 'error', message: text });
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      addAlert({ type: 'success', message: t('admin.quizDeleted') });
      setDeleteId(null);
      refetch();
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedDeleteQuiz');
      addAlert({ type: 'error', message: text });
    }
  };

  return {
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
  };
}
