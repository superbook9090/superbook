// src/app/(dashboard)/dashboard/student/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import CourseCard from '@/features/courses/components/CourseCard';
import Alert from '@/components/ui/Alert';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useEnrollments, useDropEnrollment, type Enrollment } from '@/lib/react-query/hooks';

export default function StudentCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [enrollmentToDrop, setEnrollmentToDrop] = useState<string | null>(null);

  const { data: enrollments = [], isLoading, error } = useEnrollments();
  const dropEnrollment = useDropEnrollment();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [status, session, router]);

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

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] truncate">{t('courses.myCourses')}</h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('courses.continueLearning')}
          </p>
        </div>
        <a
          href="/dashboard/student/browse"
          className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
        >
          {t('courses.browseMore')}
        </a>
      </div>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {error && (
        <div className="mt-4 bg-[var(--error-light)] border-l-4 border-[var(--error)] p-4">
          <p className="text-sm text-[var(--error)]">{String(error)}</p>
        </div>
      )}

      <div className="mt-8">
        {enrollments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-[var(--color-muted-foreground)] mb-4">{t('courses.noCourses')}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]/60 mb-4">
              {t('courses.startLearning')}
            </p>
            <a
              href="/dashboard/student/browse"
              className={`inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:px-4 sm:py-2.5 sm:w-auto w-full border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-all`}
            >
              {t('courses.browseMore')}
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment: Enrollment) => (
              <CourseCard
                key={enrollment._id}
                course={enrollment}
                type="enrolled"
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDropModalOpen}
        title={t('courses.dropCourse')}
        message={t('courses.dropCourse')}
        onConfirm={confirmDrop}
        onCancel={() => {
          setIsDropModalOpen(false);
          setEnrollmentToDrop(null);
        }}
        type="warning"
        isLoading={dropEnrollment.isPending}
      />
    </div>
  );
}
