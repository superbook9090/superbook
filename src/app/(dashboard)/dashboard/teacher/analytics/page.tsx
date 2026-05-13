// src/app/(dashboard)/dashboard/teacher/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { fetchAnalytics } from '@/lib/api/analytics';
import { ApiClientError } from '@/lib/api/http';

interface CourseStat {
  _id: string;
  title: string;
  students: number;
  quizzes: number;
  attempts: number;
  averageScore: number;
  isPublished: boolean;
}

interface TopStudent {
  name: string;
  averageScore: number;
  attempts: number;
}

interface TeacherStats {
  courses: CourseStat[];
  overview: {
    totalCourses: number;
    totalStudents: number;
    totalQuizzes: number;
    totalAttempts: number;
    averageScore: number;
    publishedCourses: number;
  };
  topStudents: TopStudent[];
}

export default function TeacherAnalyticsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Role-based redirect handled in /dashboard/page.tsx - no redirect here

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const data = (await fetchAnalytics('teacher')) as { stats?: TeacherStats };
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Error loading analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        {error && <p className="text-[var(--error)] mb-4">{error}</p>}
        <button
          onClick={fetchStats}
          className={`px-4 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-md hover:opacity-90`}
        >
          {t('analytics.retry')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('analytics.myAnalytics')}</h1>
      <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
        {t('analytics.analyticsDesc')}
      </p>

      {/* Overview Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[var(--card-solid)] rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-[var(--success)]">{stats.overview.totalCourses}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('analytics.totalCourses')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-[var(--info)]">{stats.overview.publishedCourses}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('analytics.published')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-[var(--student-primary)]">{stats.overview.totalStudents}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('analytics.totalStudents')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-[var(--student-accent)]">{stats.overview.totalQuizzes}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('analytics.quizzes')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-[var(--admin-primary)]">{stats.overview.totalAttempts}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('analytics.quizAttempts')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-[var(--warning)]">{stats.overview.averageScore}%</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('analytics.avgScore')}</p>
        </div>
      </div>

      {/* Course Breakdown */}
      <div className="mt-8">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-4">{t('analytics.coursePerformance')}</h2>
        {stats.courses.length === 0 ? (
          <div className="bg-[var(--card-solid)] rounded-lg shadow p-8 text-center">
            <p className="text-[var(--color-muted-foreground)] mb-4">{t('analytics.noCoursesYet')}</p>
            <a
              href="/dashboard/teacher/courses/create"
              className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
            >
              {t('analytics.createCourse')}
            </a>
          </div>
        ) : (
          <div className="bg-[var(--card-solid)] rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--color-muted)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('analytics.course')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('analytics.students')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('analytics.quizzes')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('analytics.attempts')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('analytics.avgScore')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('analytics.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--card-solid)] divide-y divide-[var(--border)]">
                  {stats.courses.map((course) => (
                    <tr key={course._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-[var(--color-foreground)]">{course.title}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm text-[var(--color-foreground)]">{course.students}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm text-[var(--color-foreground)]">{course.quizzes}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm text-[var(--color-foreground)]">{course.attempts}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.averageScore >= 70
                            ? 'bg-[var(--success-light)] text-[var(--success)]'
                            : course.averageScore >= 50
                            ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                            : 'bg-[var(--error-light)] text-[var(--error)]'
                        }`}>
                          {course.averageScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.isPublished
                            ? 'bg-[var(--success-light)] text-[var(--success)]'
                            : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'
                        }`}>
                          {course.isPublished ? t('analytics.published') : t('analytics.draft')}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Top Students */}
      <div className="mt-8">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-4">{t('analytics.topPerformingStudents')}</h2>
        {stats.topStudents.length === 0 ? (
          <div className="bg-[var(--card-solid)] rounded-lg shadow p-6 text-center">
            <p className="text-[var(--color-muted-foreground)]">{t('analytics.noQuizAttempts')}</p>
          </div>
        ) : (
          <div className="bg-[var(--card-solid)] rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--color-muted)]">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('analytics.student')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('analytics.attempts')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('analytics.averageScore')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card-solid)] divide-y divide-[var(--border)]">
                {stats.topStudents.map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="flex-shrink-0 h-8 w-8 rounded-full bg-[var(--success-light)] flex items-center justify-center text-[var(--success)] font-semibold text-sm">
                          {index + 1}
                        </span>
                        <p className="ml-3 text-sm font-medium text-[var(--color-foreground)]">{student.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <p className="text-sm text-[var(--color-foreground)]">{student.attempts}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.averageScore >= 70
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : student.averageScore >= 50
                          ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                          : 'bg-[var(--error-light)] text-[var(--error)]'
                      }`}>
                        {student.averageScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
