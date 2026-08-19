'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { LazyCourseCard, LazyCourseFilters, LazyJoinCourseByCode } from '@/lib/lazy';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageWrapper, ResponsiveGrid } from '@/components/layout';
import { useAvailableCourses, useEnrollCourse } from '@/lib/react-query/hooks';
import { BookOpen, Sparkles, Compass } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { FilterPanel } from '@/components/filters/DashboardListFilters';

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
    if (!session) {
      router.push(ROUTES.login);
    }
  }, [status, session, router]);

  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    availableCourses.forEach((c) => {
      if (c.category) cats.add(c.category);
    });
    return Array.from(cats);
  }, [availableCourses]);

  const instructors = useMemo(() => {
    const insts = new Set<string>(['All']);
    availableCourses.forEach((c) => {
      if (c.instructor?.name) insts.add(c.instructor.name);
    });
    return Array.from(insts);
  }, [availableCourses]);

  const filteredCourses = useMemo(() => {
    return availableCourses.filter((c) => {
      const searchLower = searchQuery.toLowerCase().trim();
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

  if (status === 'loading' || coursesLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      {/* Header Area */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner"
      >
        <div className="stack-page--compact">
          <BackButton
            href={ROUTES.student.courses}
            label={t('courses.backToCourses')}
            className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-[var(--card-gap)]">
            <div className="flex flex-col gap-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--student-primary)]">
                <Compass className="w-3.5 h-3.5" />
                <span>Course Catalog</span>
              </div>
              <h1 className="heading-xl">{t('courses.browseCourses')}</h1>
              <p className="text-[var(--color-muted-foreground)] text-sm sm:text-base max-w-xl">
                {t('courses.browseDesc')}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl p-4 shadow-sm min-w-[200px]">
              <div className="text-right flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted-foreground)]">
                  {t('courses.availableCourses')}
                </p>
                <p className="text-2xl font-black leading-none mt-1 tabular-nums text-[var(--student-primary)]">
                  {availableCourses.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--student-primary)] text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Join private course */}
      <LazyJoinCourseByCode />

      {/* Filters Section */}
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

      {/* Grid Content */}
      <ResponsiveGrid variant="cards">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-[var(--card-solid)] border border-dashed border-[var(--border)] rounded-2xl p-8">
            <BookOpen className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-30" />
            <h3 className="heading-md text-[var(--color-foreground)] mb-1">
              {t('courses.noAvailableCourses')}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
              {t('courses.tryAdjustingFilters')}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[var(--student-primary)] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[var(--student-hover)] transition-colors shadow-sm"
            >
              {t('common.reset')}
            </button>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <LazyCourseCard
                course={course}
                type="available"
                onEnroll={handleEnroll}
              />
            </motion.div>
          ))
        )}
      </ResponsiveGrid>
    </PageWrapper>
  );
}
