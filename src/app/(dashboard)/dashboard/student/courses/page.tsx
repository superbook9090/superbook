// src/app/(dashboard)/dashboard/student/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { motion } from 'framer-motion';
import Loader from '@/components/ui/Loader';
import CourseCard from '@/components/dashboard/CourseCard';
import Alert from '@/components/ui/Alert';

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    category?: string;
    price: number;
    instructor: { name: string; email: string };
    isPublished: boolean;
  };
  progress: number;
  status: string;
  enrolledAt: string;
}

export default function StudentCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Auth and role-based redirects handled by middleware and /dashboard/page.tsx

    fetchEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments');
      const data = await response.json();
      if (response.ok) {
        setEnrollments(data.enrollments || []);
      } else {
        setError(data.message || 'Failed to load courses');
      }
    } catch {
      setError('Error loading courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (enrollmentId: string) => {
    if (!confirm(t('courses.dropCourse'))) return;

    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEnrollments(enrollments.filter(e => e._id !== enrollmentId));
      } else {
        const data = await response.json();
        setAlertState({ type: 'error', message: data.message || t('courses.dropFailed') });
      }
    } catch {
      setAlertState({ type: 'error', message: t('courses.dropFailed') });
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('courses.myCourses')}</h1>
          <p className="mt-2 text-gray-600">
            {t('courses.continueLearning')}
          </p>
        </div>
        <a
          href="/dashboard/student/browse"
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
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
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{t('courses.noCourses')}</p>
            <p className="text-sm text-gray-400 mb-4">
              {t('courses.startLearning')}
            </p>
            <a
              href="/dashboard/student/browse"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
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
    </div>
  );
}
