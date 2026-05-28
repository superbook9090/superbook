'use client';

import { BookOpen, ArrowUpDown } from 'lucide-react';
import DashboardListFilters from '@/components/filters/DashboardListFilters';
import { buildPublishStatusOptions } from '@/components/filters/publishStatusOptions';
import { useTranslation } from '@/hooks/useTranslation';
import type { QuizSortOption, QuizStatusFilter } from '@/features/quizzes/utils/quizListFilters';

interface QuizFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: QuizStatusFilter;
  onStatusChange: (value: QuizStatusFilter) => void;
  courseFilter: string;
  onCourseChange: (value: string) => void;
  courses: Array<{ _id: string; title: string }>;
  sort: QuizSortOption;
  onSortChange: (value: QuizSortOption) => void;
  onClear: () => void;
  searchPlaceholder?: string;
  className?: string;
}

export default function QuizFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  courseFilter,
  onCourseChange,
  courses,
  sort,
  onSortChange,
  onClear,
  searchPlaceholder,
  className,
}: QuizFiltersProps) {
  const { t } = useTranslation();

  const courseOptions = [
    { id: 'all', label: t('teacherQuizzes.allCourses') },
    ...courses.map((course) => ({ id: course._id, label: course.title })),
  ];

  const sortOptions = [
    { id: 'newest', label: t('teacherQuizzes.sortNewest') },
    { id: 'oldest', label: t('teacherQuizzes.sortOldest') },
    { id: 'titleAsc', label: t('teacherQuizzes.sortTitleAsc') },
    { id: 'titleDesc', label: t('teacherQuizzes.sortTitleDesc') },
  ];

  return (
    <DashboardListFilters
      className={className}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onClear={onClear}
      searchPlaceholder={searchPlaceholder ?? t('teacherQuizzes.searchQuizzes')}
      segmentedFilter={{
        value: statusFilter,
        onChange: (id) => onStatusChange(id as QuizStatusFilter),
        neutralValue: 'all',
        options: buildPublishStatusOptions({
          all: t('teacherQuizzes.allQuizzes'),
          published: t('teacherQuizzes.published'),
          draft: t('teacherQuizzes.draft'),
        }),
      }}
      chipGroups={[
        ...(courses.length > 1
          ? [
              {
                label: t('teacherQuizzes.tableCourse'),
                icon: <BookOpen className="w-3.5 h-3.5" aria-hidden />,
                value: courseFilter,
                onChange: onCourseChange,
                options: courseOptions,
                neutralValue: 'all',
                minOptions: 2,
              },
            ]
          : []),
        {
          label: t('teacherQuizzes.sort'),
          icon: <ArrowUpDown className="w-3.5 h-3.5" aria-hidden />,
          value: sort,
          onChange: (id: string) => onSortChange(id as QuizSortOption),
          options: sortOptions,
          neutralValue: 'newest',
        },
      ]}
    />
  );
}
