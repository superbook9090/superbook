'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, Clock, TrendingUp, Sparkles, Compass } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { LazyCourseCard, LazyConfirmModal, LazyCourseFilters } from '@/lib/lazy';
import { useEnrollments, useDropEnrollment } from '@/lib/react-query/hooks';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import type { CourseStatusFilter } from '@/features/courses/components/CourseFilters';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import { StudentPageBanner } from '@/features/student/components/StudentPageBanner';

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
    if (!session) router.push(ROUTES.login);
  }, [status, session, router]);

  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    enrollments.forEach((e) => { if (e.course.category) cats.add(e.course.category); });
    return Array.from(cats);
  }, [enrollments]);

  const instructors = useMemo(() => {
    const insts = new Set<string>(['All']);
    enrollments.forEach((e) => { if (e.course.instructor?.name) insts.add(e.course.instructor.name); });
    return Array.from(insts);
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    return enrollments.filter((e) => {
      const matchesSearch =
        !searchLower ||
        e.course.title.toLowerCase().includes(searchLower) ||
        e.course.description?.toLowerCase().includes(searchLower) ||
        e.course.instructor?.name?.toLowerCase().includes(searchLower);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' ? e.progress === 100 : e.progress < 100);
      const matchesCategory = selectedCategory === 'All' || e.course.category === selectedCategory;
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

  if (status === 'loading' || isLoading) return <PageSkeleton />;

  const inProgressCount = enrollments.filter((e) => e.progress < 100).length;
  const completedCount = enrollments.filter((e) => e.progress === 100).length;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
      : 0;

  return (
    <PageWrapper>
      <StudentPageBanner
        icon={Sparkles}
        eyebrow={t('dashboard.learningHub')}
        title={t('courses.myCourses')}
        description={t('dashboard.continueLearning').replace('{count}', String(enrollments.length))}
        actions={
          <Link href={ROUTES.student.browse} className="student-cta-btn w-full sm:w-auto">
            <Compass className="w-4 h-4" />
            <span>{t('courses.browseMore')}</span>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={Clock} value={inProgressCount} label={t('courses.inProgress')} color="student" delay={0.05} />
        <StatCard icon={CheckCircle} value={completedCount} label={t('courses.completed')} color="success" delay={0.1} />
        <StatCard
          icon={TrendingUp}
          value={avgProgress}
          label={t('dashboard.averageProgress')}
          color="warning"
          delay={0.15}
          suffix="%"
          showProgress
          progress={avgProgress}
        />
      </div>

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
          showStatusFilter
          searchPlaceholder={t('common.search')}
        />
      </FilterPanel>

      {filteredEnrollments.length === 0 ? (
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
          {filteredEnrollments.map((enrollment) => (
            <LazyCourseCard
              key={enrollment._id}
              course={enrollment}
              type="enrolled"
              onDrop={handleDrop}
            />
          ))}
        </ResponsiveGrid>
      )}

      <LazyConfirmModal
        isOpen={isDropModalOpen}
        title={t('courses.dropCourse')}
        message={t('courses.dropCourseConfirm')}
        onConfirm={confirmDrop}
        cancelText={t('common.no')}
        onCancel={() => { setIsDropModalOpen(false); setEnrollmentToDrop(null); }}
        type="warning"
        isLoading={dropEnrollment.isPending}
      />
    </PageWrapper>
  );
}
