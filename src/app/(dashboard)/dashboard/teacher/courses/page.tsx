// src/app/(dashboard)/dashboard/teacher/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import Alert from '@/components/ui/Alert';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category?: string;
  price: number;
  isPublished: boolean;
  enrolledStudents: string[];
  createdAt: string;
}

export default function TeacherCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Role-based redirect handled in /dashboard/page.tsx - no redirect here

    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses?instructor=self');
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses || []);
      } else {
        const errorMsg = data.message || t('teacherCourses.failedLoadCourses');
        setError(errorMsg);
        setAlertState({ type: 'error', message: errorMsg });
      }
    } catch {
      const errorMsg = t('teacherCourses.errorLoadingCourses');
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">{t('teacherCourses.loadingCourses')}</div>
  }

  return (
    <>
      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('teacherCourses.myCourses')}</h1>
          <a
            href="/dashboard/teacher/courses/create"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
          >
            {t('teacherCourses.createNewCourse')}
          </a>
        </div>
        <p className="mt-2 text-gray-600">
          {t('teacherCourses.coursesDesc')}
        </p>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8">
        {courses.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-gray-500 mb-4">{t('teacherCourses.noCoursesYet')}</p>
              <a
                href="/dashboard/teacher/courses/create"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
              >
                {t('teacherCourses.createFirstCourse')}
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {course.thumbnail ? (
                  <div className="relative h-40">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-4xl">📚</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.isPublished ? t('teacherCourses.published') : t('teacherCourses.draft')}
                    </span>
                    {course.category && (
                      <span className="text-xs text-gray-500">{course.category}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description || t('teacherCourses.noDescription')}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{course.enrolledStudents?.length || 0} {t('teacherCourses.studentsEnrolled')}</span>
                    <span>{course.price > 0 ? `₹${course.price}` : t('teacherCourses.free')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
