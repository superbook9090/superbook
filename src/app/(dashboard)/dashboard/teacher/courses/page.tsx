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
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
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
      {/* Hero Banner Header */}
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 md:p-8 rounded-3xl">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('teacherCourses.myCourses')}</span>
          </div>
          <h1 className="heading-xl">{t('teacherCourses.myCourses')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">{t('teacherCourses.coursesDesc')}</p>
        </div>

        <Link
          href={ROUTES.teacher.courseCreate}
          className="btn-premium inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('teacherCourses.createNewCourse')}</span>
        </Link>
      </div>

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
          <div className="text-center py-16 px-4 bg-[var(--card-solid)] antigravity-glass border border-dashed border-[var(--border)] rounded-3xl">
            <BookOpen className="w-12 h-12 text-[var(--muted)] mx-auto mb-3 opacity-30" />
            <h3 className="heading-md text-[var(--color-foreground)] mb-1">
              {t('courses.noCoursesFound')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-5">
              {t('courses.tryAdjustingFilters')}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[var(--teacher-primary)] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[var(--teacher-hover)] transition-colors shadow-sm min-h-[44px]"
            >
              {t('common.reset')}
            </button>
          </div>
        ) : (
          <div className="perspective-1000">
            <ResponsiveGrid variant="dense">
              {filteredCourses.map((course: Course) => (
                <TeacherCourseCard key={course._id} course={course} />
              ))}
            </ResponsiveGrid>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
