// src/app/(dashboard)/dashboard/student/courses/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import CourseCard from '@/features/courses/components/CourseCard';
import Alert from '@/components/ui/Alert';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useEnrollments, useDropEnrollment } from '@/lib/react-query/hooks';
import { BookOpen, CheckCircle, Clock, TrendingUp, Sparkles } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import CourseFilters, { type CourseStatusFilter } from '@/features/courses/components/CourseFilters';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import { PageWrapper, ResponsiveGrid } from '@/components/layout';

export default function StudentCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  
  // States
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [enrollmentToDrop, setEnrollmentToDrop] = useState<string | null>(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatusFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('All');

  const { data: enrollments = [], isLoading, error } = useEnrollments();
  const dropEnrollment = useDropEnrollment();

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
    enrollments.forEach(e => {
      if (e.course.category) cats.add(e.course.category);
    });
    return Array.from(cats);
  }, [enrollments]);

  const instructors = useMemo(() => {
    const insts = new Set<string>();
    insts.add('All');
    enrollments.forEach(e => {
      if (e.course.instructor?.name) insts.add(e.course.instructor.name);
    });
    return Array.from(insts);
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = e.course.title.toLowerCase().includes(searchLower) || 
                           e.course.description?.toLowerCase().includes(searchLower) ||
                           e.course.instructor?.name?.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'completed' ? e.progress === 100 : e.progress < 100);
      
      const matchesCategory = selectedCategory === 'All' || e.course.category === selectedCategory;
      const matchesInstructor = selectedInstructor === 'All' || e.course.instructor?.name === selectedInstructor;

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
      setAlertState({ type: 'success', message: t('courses.dropSuccess') });
      setIsDropModalOpen(false);
      setEnrollmentToDrop(null);
    } catch {
      setAlertState({ type: 'error', message: t('courses.dropFailed') });
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

  const inProgressCount = enrollments.filter(e => e.progress < 100).length;
  const completedCount = enrollments.filter(e => e.progress === 100).length;
  const avgProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
    : 0;

  return (
    <PageWrapper>
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="heading-xl text-white mb-2">{t('courses.myCourses')}</h1>
            <p className="text-white/80 text-sm sm:text-base">
              {t('dashboard.continueLearning').replace('{count}', String(enrollments.length))}
            </p>
          </div>
          <button
            onClick={() => router.push(ROUTES.student.browse)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[var(--student-primary)] rounded-xl text-sm font-bold shadow-lg hover:bg-gray-50 transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4" />
            {t('courses.browseMore')}
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
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

      {/* Filters Section */}
      <FilterPanel>
        <CourseFilters
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

      {/* Course Grid */}
      <ResponsiveGrid variant="dense">
        {filteredEnrollments.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-gray-50/50 border border-dashed border-[var(--border)] rounded-2xl">
            <BookOpen className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-20" />
            <h3 className="heading-md text-[var(--color-foreground)] mb-1">{t('courses.noCoursesFound')}</h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-6">{t('courses.tryAdjustingFilters')}</p>
            <button 
              onClick={clearFilters}
              className="px-6 py-2 bg-[var(--color-foreground)] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {t('common.reset')}
            </button>
          </div>
        ) : (
          filteredEnrollments.map((enrollment) => (
            <motion.div
              key={enrollment._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <CourseCard
                course={enrollment}
                type="enrolled"
                onDrop={handleDrop}
              />
            </motion.div>
          ))
        )}
      </ResponsiveGrid>

      <ConfirmModal
        isOpen={isDropModalOpen}
        title={t('courses.dropCourse')}
        message={t('courses.dropCourseConfirm')}
        onConfirm={confirmDrop}
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
