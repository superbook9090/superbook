// src/app/(dashboard)/dashboard/student/browse/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { LazyCourseCard } from '@/lib/lazy';
import Alert from '@/components/ui/Alert';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageWrapper, ResponsiveGrid } from '@/components/layout';
import { useAvailableCourses, useEnrollCourse } from '@/lib/react-query/hooks';
import { BookOpen, Sparkles } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { LazyCourseFilters, LazyJoinCourseByCode } from '@/lib/lazy';
import { FilterPanel } from '@/components/filters/DashboardListFilters';

export default function BrowseCoursesPage() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();

  // States
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('All');

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: availableCourses = [], isLoading: coursesLoading, error } = useAvailableCourses(orgId);
  const enrollCourse = useEnrollCourse();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
    }
  }, [status, session, router]);

  // Derived Data
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    availableCourses.forEach(c => {
      if (c.category) cats.add(c.category);
    });
    return Array.from(cats);
  }, [availableCourses]);

  const instructors = useMemo(() => {
    const insts = new Set<string>();
    insts.add('All');
    availableCourses.forEach(c => {
      if (c.instructor?.name) insts.add(c.instructor.name);
    });
    return Array.from(insts);
  }, [availableCourses]);

  const filteredCourses = useMemo(() => {
    return availableCourses.filter(c => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = c.title.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.instructor?.name?.toLowerCase().includes(searchLower);

      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesInstructor = selectedInstructor === 'All' || c.instructor?.name === selectedInstructor;

      return matchesSearch && matchesCategory && matchesInstructor;
    });
  }, [availableCourses, searchQuery, selectedCategory, selectedInstructor]);

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollCourse.mutateAsync({ courseId });
      router.push(ROUTES.student.courses);
    } catch {
      setAlertState({ type: 'error', message: t('courses.errorEnrolling') });
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner"
      >
        <div className="space-y-4">
          <BackButton
            href={ROUTES.student.courses}
            label={t('courses.backToCourses')}
            className="text-xs font-black uppercase tracking-widest text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="heading-xl">{t('courses.browseCourses')}</h1>
              <p className="text-[var(--color-muted-foreground)] text-sm sm:text-base max-w-xl">
                {t('courses.browseDesc')}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[var(--card-solid)] p-4 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] min-w-[180px]">
              <div className="text-right flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">{t('courses.availableCourses')}</p>
                <p className="text-2xl font-black leading-none mt-1 tabular-nums text-[var(--color-foreground)]">{availableCourses.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg gradient-bg text-white flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
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

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {error && (
        <Alert
          type="error"
          message={String(error)}
        />
      )}

      {/* Grid Content */}
      <ResponsiveGrid variant="cards">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-[var(--color-surface-muted)]/50 border border-dashed border-[var(--border)] rounded-2xl">
            <BookOpen className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-20" />
            <h3 className="heading-md text-[var(--color-foreground)] mb-1">{t('courses.noAvailableCourses')}</h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-6">{t('courses.tryAdjustingFilters')}</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-[var(--color-foreground)] text-[var(--background)] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {t('common.reset')}
            </button>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, scale: 0.95 }}
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
