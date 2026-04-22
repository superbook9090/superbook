// src/app/(dashboard)/dashboard/student/browse/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useCachedStore } from '@/store/useCachedStore';
import CourseCard from '@/features/courses/components/CourseCard';
import Alert from '@/components/ui/Alert';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function BrowseCoursesPage() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const { courses: coursesCache, fetchCourses, invalidateCourses } = useCachedStore();
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const orgId = session?.user?.organizationId || 'public';
  const courseState = coursesCache[orgId];
  const courses = courseState?.data || [];
  const isLoading = courseState?.loading ?? true;
  const error = courseState?.error || '';

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    fetchCourses(orgId);
  }, [session, status, orgId, fetchCourses, router]);

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Invalidate courses cache and enrollments cache
        invalidateCourses(orgId);
        // Redirect to my courses
        router.push('/dashboard/student/courses');
      } else {
        setAlertState({ type: 'error', message: data.message || 'Failed to enroll' });
      }
    } catch {
      setAlertState({ type: 'error', message: 'Error enrolling in course' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Course cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('courses.browseCourses')}</h1>
      <p className="mt-2 text-gray-600">
        {t('courses.browseDesc')}
      </p>

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
        {courses.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-gray-500 mb-4">
                {t('courses.noAvailableCourses')}
              </p>
              <a
                href="/dashboard/student/courses"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
              >
                {t('courses.goToMyCourses')}
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                type="available"
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
