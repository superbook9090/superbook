'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useTeacherCourses, type Course } from '@/lib/react-query/hooks';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import Button from '@/components/ui/Button';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';
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
    if (!session) router.push(ROUTES.login);
  }, [status, session, router]);

  useEffect(() => {
    if (error) addAlert({ type: 'error', message: String(error) });
  }, [error, addAlert]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    courses.forEach((c: Course) => { if (c.category) cats.add(c.category); });
    return Array.from(cats);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return courses.filter((course: Course) => {
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        Boolean(course.description && course.description.toLowerCase().includes(q));
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && course.isPublished) ||
        (statusFilter === 'draft' && !course.isPublished) ||
        (statusFilter === 'private' && (course as { isPrivate?: boolean }).isPrivate);
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [courses, searchQuery, statusFilter, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedCategory('All');
  };

  if (status === 'loading' || isLoading) return <PageSkeleton />;

  return (
    <PageWrapper>
      <TeacherPageBanner
        icon={BookOpen}
        eyebrow={t('common.myCourses')}
        title={t('teacherCourses.myCourses')}
        description={t('teacherCourses.coursesDesc')}
        actions={
          <Link href={ROUTES.teacher.courseCreate} className="teacher-cta-btn w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            <span>{t('teacherCourses.createNewCourse')}</span>
          </Link>
        }
      />

      {courses.length > 0 && <TeacherCoursesStats courses={courses} />}

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

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('teacherCourses.noCoursesYet')}
          description={t('teacherCourses.coursesDesc')}
          action={
            <Link href={ROUTES.teacher.courseCreate} className="teacher-cta-btn">
              <Plus className="w-4 h-4" />
              <span>{t('teacherCourses.createFirstCourse')}</span>
            </Link>
          }
        />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('courses.noCoursesFound')}
          description={t('courses.tryAdjustingFilters')}
          action={
            <Button onClick={clearFilters} variant="primary" className="min-h-[44px] rounded-xl px-6">
              {t('common.reset')}
            </Button>
          }
        />
      ) : (
        <ResponsiveGrid variant="dense">
          {filteredCourses.map((course: Course) => (
            <TeacherCourseCard key={course._id} course={course} />
          ))}
        </ResponsiveGrid>
      )}
    </PageWrapper>
  );
}
