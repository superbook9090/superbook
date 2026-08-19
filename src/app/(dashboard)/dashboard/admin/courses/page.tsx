'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Course } from '@/types';
import { listCoursesAdmin } from '@/lib/api/courses';
import { ApiClientError } from '@/lib/api/http';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { buildPublishStatusOptions, type PublishStatusFilter } from '@/components/filters/publishStatusOptions';
import { isSuperAdmin } from '@/lib/roles';
import { PageWrapper, PageHeader, ResponsiveGrid, EmptyState } from '@/components/layout';
import AdminCoursesStats from './_components/AdminCoursesStats';
import AdminCourseCard from './_components/AdminCourseCard';
import AdminCoursesTable from './_components/AdminCoursesTable';

export default function AdminCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const isSuperAdminUser = isSuperAdmin(session?.user?.role);
  const { t } = useTranslation();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<PublishStatusFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { addAlert } = useAlert();

  const fetchCourses = useCallback(async () => {
    try {
      const data = await listCoursesAdmin();
      setCourses((data.courses || []) as Course[]);
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedFetchCourses');
      addAlert({ type: 'error', message: text });
    } finally {
      setIsLoading(false);
    }
  }, [t, addAlert]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }
    if (status === 'authenticated') {
      fetchCourses();
    }
  }, [status, session, router, fetchCourses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        (course.instructor?.name && course.instructor.name.toLowerCase().includes(q));

      const matchesFilter =
        filter === 'all' ||
        (filter === 'published' && course.isPublished) ||
        (filter === 'draft' && !course.isPublished);

      return matchesSearch && matchesFilter;
    });
  }, [courses, searchQuery, filter]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('all');
  };

  if (isLoading || status === 'loading') {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <PageHeader
        title={t('admin.allCourses')}
        description={t('admin.manageCoursesDesc')}
        actions={
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-sm'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
              title={t('admin.viewGrid')}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.viewGrid')}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-sm'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
              title={t('admin.viewTable')}
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.viewTable')}</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <AdminCoursesStats courses={courses} />

      {/* Filters */}
      <FilterPanel>
        <DashboardListFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={clearFilters}
          searchPlaceholder={t('admin.searchCourses')}
          segmentedFilter={{
            value: filter,
            onChange: (id) => setFilter(id as PublishStatusFilter),
            neutralValue: 'all',
            options: buildPublishStatusOptions({
              all: t('admin.allCourses'),
              published: t('common.published'),
              draft: t('common.draft'),
            }),
          }}
        />
      </FilterPanel>

      {/* Course List: Grid or Table view */}
      <div>
        {courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t('admin.noCoursesFound')}
            description={t('admin.adjustSearch')}
          />
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-[var(--card-solid)] border border-dashed border-[var(--border)] rounded-2xl p-8">
            <BookOpen className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-30" />
            <h3 className="heading-md text-[var(--color-foreground)] mb-1">
              {t('admin.noCoursesFound')}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
              {t('admin.adjustSearch')}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[var(--info)] text-white rounded-xl text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              {t('common.reset')}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <ResponsiveGrid variant="cards">
            {filteredCourses.map((course) => (
              <AdminCourseCard
                key={course._id}
                course={course}
                isSuperAdmin={isSuperAdminUser}
              />
            ))}
          </ResponsiveGrid>
        ) : (
          <AdminCoursesTable
            courses={filteredCourses}
            isSuperAdmin={isSuperAdminUser}
          />
        )}
      </div>
    </PageWrapper>
  );
}
