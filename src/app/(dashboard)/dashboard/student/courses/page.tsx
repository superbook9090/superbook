// src/app/(dashboard)/dashboard/student/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { useCachedStore } from '@/store/useCachedStore';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import CourseCard from '@/features/courses/components/CourseCard';
import Alert from '@/components/ui/Alert';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function StudentCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const { enrollments: enrollmentsCache, fetchEnrollments, invalidateEnrollments } = useCachedStore();
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [enrollmentToDrop, setEnrollmentToDrop] = useState<string | null>(null);
  const [isDropping, setIsDropping] = useState(false);

  const userId = session?.user?.id;
  const enrollmentState = userId ? enrollmentsCache[userId] : null;
  const enrollments = enrollmentState?.data || [];
  const isLoading = enrollmentState?.loading ?? true;
  const error = enrollmentState?.error || '';

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    if (userId) {
      fetchEnrollments(userId);
    }
  }, [session, status, userId, fetchEnrollments, router]);

  const handleDrop = async (enrollmentId: string) => {
    setEnrollmentToDrop(enrollmentId);
    setIsDropModalOpen(true);
  };

  const confirmDrop = async () => {
    if (!enrollmentToDrop) return;

    setIsDropping(true);
    try {
      const response = await fetch(`/api/enrollments/${enrollmentToDrop}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        invalidateEnrollments(userId);
        setAlertState({ type: 'success', message: t('courses.dropSuccess') || 'Course dropped successfully' });
      } else {
        const data = await response.json();
        setAlertState({ type: 'error', message: data.message || t('courses.dropFailed') });
      }
    } catch {
      setAlertState({ type: 'error', message: t('courses.dropFailed') });
    } finally {
      setIsDropping(false);
      setIsDropModalOpen(false);
      setEnrollmentToDrop(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Course grid skeleton */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('courses.myCourses')}</h1>
          <p className="mt-2 text-gray-600">
            {t('courses.continueLearning')}
          </p>
        </div>
        <a
          href="/dashboard/student/browse"
          className={`inline-flex items-center justify-center px-4 py-2.5 sm:w-auto w-full border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-all`}
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
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-8">
        {enrollments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 mb-4">{t('courses.noCourses')}</p>
            <p className="text-sm text-gray-400 mb-4">
              {t('courses.startLearning')}
            </p>
            <a
              href="/dashboard/student/browse"
              className={`inline-flex items-center justify-center px-4 py-2.5 sm:w-auto w-full border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-all`}
            >
              {t('courses.browseMore')}
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
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
        isLoading={isDropping}
      />
    </div>
  );
}
