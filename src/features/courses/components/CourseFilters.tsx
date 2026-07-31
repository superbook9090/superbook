'use client';

import { SlidersHorizontal, Clock, CheckCircle, Sparkles } from 'lucide-react';
import DashboardListFilters from '@/components/filters/DashboardListFilters';
import { useTranslation } from '@/hooks/useTranslation';

export type CourseStatusFilter = 'all' | 'in-progress' | 'completed';

interface CourseFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  selectedInstructor?: string;
  onInstructorChange?: (value: string) => void;
  instructors?: string[];
  statusFilter?: CourseStatusFilter;
  onStatusChange?: (value: CourseStatusFilter) => void;
  onClear: () => void;
  showStatusFilter?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

export default function CourseFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedInstructor = 'All',
  onInstructorChange,
  instructors = [],
  statusFilter,
  onStatusChange,
  onClear,
  showStatusFilter = false,
  searchPlaceholder,
  className,
}: CourseFiltersProps) {
  const { t } = useTranslation();

  const chipGroups = [
    {
      label: t('courses.category'),
      value: selectedCategory,
      onChange: onCategoryChange,
      options: categories.map((cat) => ({
        id: cat,
        label: cat === 'All' ? t('common.all') : cat,
      })),
      neutralValue: 'All',
    },
    ...(instructors.length > 1 && onInstructorChange
      ? [
          {
            label: t('courses.teacher'),
            value: selectedInstructor,
            onChange: onInstructorChange,
            options: instructors.map((inst) => ({
              id: inst,
              label: inst === 'All' ? t('common.all') : inst,
            })),
            neutralValue: 'All',
            minOptions: 2,
          },
        ]
      : []),
  ];

  return (
    <DashboardListFilters
      className={className}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onClear={onClear}
      searchPlaceholder={searchPlaceholder}
      segmentedFilter={
        showStatusFilter && onStatusChange && statusFilter != null
          ? {
              value: statusFilter,
              onChange: (id) => onStatusChange(id as CourseStatusFilter),
              neutralValue: 'all',
              options: [
                { id: 'all', label: t('common.all'), icon: <SlidersHorizontal className="w-4 h-4" aria-hidden /> },
                { id: 'in-progress', label: t('courses.inProgress'), icon: <Clock className="w-4 h-4" aria-hidden /> },
                { id: 'completed', label: t('courses.completed'), icon: <CheckCircle className="w-4 h-4" aria-hidden /> },
              ],
            }
          : undefined
      }
      headerAside={
        !showStatusFilter ? (
          <div className="hidden lg:flex items-center gap-3 px-6 py-4 border border-dashed border-[var(--border)] rounded-2xl">
            <Sparkles className="w-5 h-5 text-[var(--color-warning)]" aria-hidden />
            <span className="text-xs font-black uppercase tracking-widest text-[var(--color-muted-foreground)]">
              Find your next mastery
            </span>
          </div>
        ) : undefined
      }
      chipGroups={chipGroups}
    />
  );
}
