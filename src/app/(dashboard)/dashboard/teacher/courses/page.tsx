'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTeacherCourses, type Course } from '@/lib/react-query/hooks';
import { PageWrapper, PageHeader, ResponsiveGrid, EmptyState } from '@/components/layout';
import { BookOpen, Plus } from 'lucide-react';
import TeacherCoursesStats from './_components/TeacherCoursesStats';
import TeacherCourseCard from './_components/TeacherCourseCard';
import TeacherCoursesFilter, { type TeacherStatusFilter } from './_components/TeacherCoursesFilter';

export default function TeacherCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TeacherStatusFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: courses = [], isLoading, error } = useTeacherCourses(orgId);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (error) {
      addAlert({ type: 'error', message: String(error) });
    }
  }, [error, addAlert]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    courses.forEach((c: Course) => {
      if (c.category) cats.add(c.category);
    });
    return Array.from(cats);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course: Course) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        (course.description && course.description.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && course.isPublished) ||
        (statusFilter === 'draft' && !course.isPublished) ||
        (statusFilter === 'private' && (course as { isPrivate?: boolean }).isPrivate);

      const matchesCategory =
        selectedCategory === 'All' || course.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [courses, searchQuery, statusFilter, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedCategory('All');
  };

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <PageHeader
        title={t('teacherCourses.myCourses')}
        description={t('teacherCourses.coursesDesc')}
        actions={
          <Link
            href={ROUTES.teacher.courseCreate}
            className="btn-premium w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('teacherCourses.createNewCourse')}
          </Link>
        }
      />

      {/* KPI Stats Overview */}
      {courses.length > 0 && <TeacherCoursesStats courses={courses} />}

      {/* Search & Filter Toolbar */}
      {courses.length > 0 && (
        <TeacherCoursesFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          onClear={clearFilters}
        />
      )}

      {/* Main Course Grid or Empty State */}
      <div>
        {courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t('teacherCourses.noCoursesYet')}
            description={t('teacherCourses.coursesDesc')}
            action={
              <Link
                href={ROUTES.teacher.courseCreate}
                className="btn-premium min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('teacherCourses.createFirstCourse')}
              </Link>
            }
          />
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-[var(--card-solid)] border border-dashed border-[var(--border)] rounded-2xl p-8">
            <BookOpen className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-30" />
            <h3 className="heading-md text-[var(--color-foreground)] mb-1">
              {t('courses.noCoursesFound')}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
              {t('courses.tryAdjustingFilters')}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[var(--teacher-primary)] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[var(--teacher-hover)] transition-colors shadow-sm"
            >
              {t('common.reset')}
            </button>
          </div>
        ) : (
          <ResponsiveGrid variant="dense">
            {filteredCourses.map((course: Course) => (
              <TeacherCourseCard key={course._id} course={course} />
            ))}
          </ResponsiveGrid>
        )}
      </div>
    </PageWrapper>
  );
}
