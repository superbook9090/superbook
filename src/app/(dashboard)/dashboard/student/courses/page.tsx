'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { LazyCourseCard, LazyConfirmModal, LazyCourseFilters } from '@/lib/lazy';
import { useEnrollments, useDropEnrollment } from '@/lib/react-query/hooks';
import { BookOpen, CheckCircle, Clock, TrendingUp, Sparkles, Compass } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import type { CourseStatusFilter } from '@/features/courses/components/CourseFilters';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import { PageWrapper, ResponsiveGrid } from '@/components/layout';

export default function StudentCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [enrollmentToDrop, setEnrollmentToDrop] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatusFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('All');

  const { data: enrollments = [], isLoading } = useEnrollments();
  const dropEnrollment = useDropEnrollment();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
    }
  }, [status, session, router]);

  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    enrollments.forEach((e) => {
      if (e.course.category) cats.add(e.course.category);
    });
    return Array.from(cats);
  }, [enrollments]);

  const instructors = useMemo(() => {
    const insts = new Set<string>(['All']);
    enrollments.forEach((e) => {
      if (e.course.instructor?.name) insts.add(e.course.instructor.name);
    });
    return Array.from(insts);
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        e.course.title.toLowerCase().includes(searchLower) ||
        e.course.description?.toLowerCase().includes(searchLower) ||
        e.course.instructor?.name?.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' ? e.progress === 100 : e.progress < 100);

      const matchesCategory =
        selectedCategory === 'All' || e.course.category === selectedCategory;
      const matchesInstructor =
        selectedInstructor === 'All' || e.course.instructor?.name === selectedInstructor;

      return matchesSearch && matchesStatus && matchesCategory && matchesInstructor;
    });
  }, [enrollments, searchQuery, statusFilter, selectedCategory, selectedInstructor]);

  const handleDrop = async (enrollmentId: string) => {
    setEnrollmentToDrop(enrollmentId);
    setIsDropModalOpen(true);
  };

  const confirmDrop = async () => {
    if (!enrollmentToDrop) return;
    try {
      await dropEnrollment.mutateAsync(enrollmentToDrop);
      addAlert({ type: 'success', message: t('courses.dropSuccess'), duration: 3000 });
      setIsDropModalOpen(false);
      setEnrollmentToDrop(null);
    } catch {
      addAlert({ type: 'error', message: t('courses.dropFailed'), duration: 5000 });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedCategory('All');
    setSelectedInstructor('All');
  };

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  const inProgressCount = enrollments.filter((e) => e.progress < 100).length;
  const completedCount = enrollments.filter((e) => e.progress === 100).length;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
      : 0;

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-[var(--card-gap)]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--student-primary)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Learning Hub</span>
            </div>
            <h1 className="heading-xl">{t('courses.myCourses')}</h1>
            <p className="text-[var(--color-muted-foreground)] text-sm sm:text-base">
              {t('dashboard.continueLearning').replace('{count}', String(enrollments.length))}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => router.push(ROUTES.student.browse)}
              className="btn-premium"
            >
              <Compass className="w-4 h-4" />
              <span>{t('courses.browseMore')}</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <ResponsiveGrid variant="cards">
        <StatCard
          icon={Clock}
          value={inProgressCount}
          label={t('courses.inProgress')}
          color="student"
          delay={0.1}
        />
        <StatCard
          icon={CheckCircle}
          value={completedCount}
          label={t('courses.completed')}
          color="success"
          delay={0.2}
        />
        <StatCard
          icon={TrendingUp}
          value={avgProgress}
          label={t('dashboard.averageProgress')}
          color="warning"
          delay={0.3}
          suffix="%"
          showProgress={true}
          progress={avgProgress}
        />
      </ResponsiveGrid>

      {/* Filter Panel */}
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
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onClear={clearFilters}
          showStatusFilter={true}
          searchPlaceholder={t('common.search')}
        />
      </FilterPanel>

      {/* Enrolled Courses Grid */}
      <ResponsiveGrid variant="dense">
        {filteredEnrollments.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-[var(--card-solid)] border border-dashed border-[var(--border)] rounded-2xl p-8">
            <BookOpen className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-30" />
            <h3 className="heading-md text-[var(--color-foreground)] mb-1">
              {t('courses.noCoursesFound')}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
              {t('courses.tryAdjustingFilters')}
            </p>
            <Button onClick={clearFilters} variant="primary">
              {t('common.reset')}
            </Button>
          </div>
        ) : (
          filteredEnrollments.map((enrollment) => (
            <motion.div
              key={enrollment._id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <LazyCourseCard
                course={enrollment}
                type="enrolled"
                onDrop={handleDrop}
              />
            </motion.div>
          ))
        )}
      </ResponsiveGrid>

      <LazyConfirmModal
        isOpen={isDropModalOpen}
        title={t('courses.dropCourse')}
        message={t('courses.dropCourseConfirm')}
        onConfirm={confirmDrop}
        cancelText={t('common.no')}
        onCancel={() => {
          setIsDropModalOpen(false);
          setEnrollmentToDrop(null);
        }}
        type="warning"
        isLoading={dropEnrollment.isPending}
      />
    </PageWrapper>
  );
}
