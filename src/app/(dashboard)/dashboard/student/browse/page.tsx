// src/app/(dashboard)/dashboard/student/browse/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import CourseCard from '@/components/dashboard/CourseCard';
import Alert from '@/components/ui/Alert';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category?: string;
  price: number;
  instructor: { name: string; email: string };
  isPublished: boolean;
}

export default function BrowseCoursesPage() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user?.role === 'teacher' || session.user?.role === 'admin') {
      router.push('/dashboard/teacher');
      return;
    }

    fetchAvailableCourses();
  }, [session, status, router]);

  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch('/api/courses?available=true');
      const data = await response.json();
      if (response.ok) {
        setCourses(data.courses || []);
      } else {
        setError(data.message || 'Failed to load courses');
      }
    } catch (err) {
      setError('Error loading courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Remove enrolled course from list and redirect to my courses
        setCourses(courses.filter(c => c._id !== courseId));
        router.push('/dashboard/student/courses');
      } else {
        setAlertState({ type: 'error', message: data.message || 'Failed to enroll' });
      }
    } catch (err) {
      setAlertState({ type: 'error', message: 'Error enrolling in course' });
    } finally {
      setEnrollingId(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
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
