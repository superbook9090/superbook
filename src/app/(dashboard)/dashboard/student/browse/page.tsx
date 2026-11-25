'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Sparkles, Compass } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { LazyCourseCard, LazyCourseFilters, LazyJoinCourseByCode } from '@/lib/lazy';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import { useAvailableCourses, useEnrollCourse } from '@/lib/react-query/hooks';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import Button from '@/components/ui/Button';
import { StudentPageBanner } from '@/features/student/components/StudentPageBanner';

export default function BrowseCoursesPage() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const { addAlert } = useAlert();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('All');

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: availableCourses = [], isLoading: coursesLoading } = useAvailableCourses(orgId);
  const enrollCourse = useEnrollCourse();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push(ROUTES.login);
  }, [status, session, router]);

  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    availableCourses.forEach((c) => { if (c.category) cats.add(c.category); });
    return Array.from(cats);
  }, [availableCourses]);

  const instructors = useMemo(() => {
    const insts = new Set<string>(['All']);
    availableCourses.forEach((c) => { if (c.instructor?.name) insts.add(c.instructor.name); });
    return Array.from(insts);
  }, [availableCourses]);

  const filteredCourses = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    return availableCourses.filter((c) => {
      const matchesSearch =
        !searchLower ||
        c.title.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.instructor?.name?.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesInstructor =
        selectedInstructor === 'All' || c.instructor?.name === selectedInstructor;
      return matchesSearch && matchesCategory && matchesInstructor;
    });
  }, [availableCourses, searchQuery, selectedCategory, selectedInstructor]);

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollCourse.mutateAsync({ courseId });
      addAlert({ type: 'success', message: 'Enrolled successfully!' });
      router.push(ROUTES.student.courses);
    } catch {
      addAlert({ type: 'error', message: t('courses.errorEnrolling'), duration: 5000 });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedInstructor('All');
  };

  if (status === 'loading' || coursesLoading) return <PageSkeleton />;

  return (
    <PageWrapper>
      <StudentPageBanner
        icon={Compass}
        eyebrow={t('courses.courseCatalog')}
        title={t('courses.browseCourses')}
        description={t('courses.browseDesc')}
        backHref={ROUTES.student.courses}
        backLabel={t('courses.backToCourses')}
        actions={
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]/80 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('courses.availableCourses')}
              </p>
              <p className="text-xl font-extrabold leading-none mt-1 tabular-nums text-[var(--student-primary)]">
                {availableCourses.length}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl gradient-bg text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        }
      />

      <LazyJoinCourseByCode />

      <FilterPanel>
        <LazyCourseFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          selectedInstructor={selectedInstructor}
          onInstructorChange={setSelectedInstructor}
          instructors={instructors}
          onClear={clearFilters}
          showStatusFilter={false}
          searchPlaceholder={t('common.search')}
        />
      </FilterPanel>

      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('courses.noAvailableCourses')}
          description={t('courses.tryAdjustingFilters')}
          action={
            <Button onClick={clearFilters} variant="primary" className="min-h-[44px] rounded-xl px-6">
              {t('common.reset')}
            </Button>
          }
        />
      ) : (
        <ResponsiveGrid variant="dense">
          {filteredCourses.map((course) => (
            <LazyCourseCard
              key={course._id}
              course={course}
              type="available"
              onEnroll={handleEnroll}
            />
          ))}
        </ResponsiveGrid>
      )}
    </PageWrapper>
  );
}
