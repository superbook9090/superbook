'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, LayoutGrid, Table as TableIcon, Trash2 } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import Button from '@/components/ui/Button';
import InactiveCoursesCleanupModal from '@/components/admin/InactiveCoursesCleanupModal';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Course } from '@/types';
import { listCoursesAdmin } from '@/lib/api/courses';
import { ApiClientError } from '@/lib/api/http';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { buildPublishStatusOptions, type PublishStatusFilter } from '@/components/filters/publishStatusOptions';
import { isSuperAdmin } from '@/lib/roles';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import { Pagination } from '@/components/ui/Pagination';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const ITEMS_PER_PAGE = 12;
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('all');
  };

  if (isLoading || status === 'loading') {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <AdminPageBanner
        icon={BookOpen}
        eyebrow={t('admin.allCourses')}
        title={t('admin.allCourses')}
        description={t('admin.manageCoursesDesc')}
        tier={isSuperAdminUser ? 'superadmin' : 'admin'}
        actions={
          <>
            {isSuperAdminUser && (
              <button
                type="button"
                onClick={() => setShowCleanupModal(true)}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-red-500/35 bg-red-500/8 text-red-600 dark:text-red-400 hover:bg-red-500/15 font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Clean Up Inactive Courses</span>
              </button>
            )}

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-[8px] text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
                title={t('admin.viewGrid')}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.viewGrid')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-[8px] text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
                title={t('admin.viewTable')}
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.viewTable')}</span>
              </button>
            </div>
          </>
        }
      />

      <AdminCoursesStats courses={courses} />

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

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('admin.noCoursesFound')}
          description={t('admin.adjustSearch')}
        />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('admin.noCoursesFound')}
          description={t('admin.adjustSearch')}
          action={
            <Button onClick={clearFilters} variant="secondary">
              {t('common.reset')}
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <>
          <ResponsiveGrid variant="dense">
            {paginatedCourses.map((course) => (
              <AdminCourseCard
                key={course._id}
                course={course}
                isSuperAdmin={isSuperAdminUser}
              />
            ))}
          </ResponsiveGrid>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <>
          <AdminCoursesTable
            courses={paginatedCourses}
            isSuperAdmin={isSuperAdminUser}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {isSuperAdminUser && (
        <InactiveCoursesCleanupModal
          isOpen={showCleanupModal}
          onClose={() => setShowCleanupModal(false)}
          onCompleted={(message) => {
            addAlert({ type: 'success', message });
            void fetchCourses();
          }}
        />
      )}
    </PageWrapper>
  );
}
