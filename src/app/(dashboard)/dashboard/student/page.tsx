// src/app/(dashboard)/dashboard/student/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Enrollment {
  _id: string;
  course: { _id: string; title: string };
  progress: number;
  status: string;
  enrolledAt: string;
}

interface Attempt {
  _id: string;
  quiz: { title: string };
  score: number;
  status: string;
  submittedAt?: string;
  startedAt: string;
}

interface Stats {
  enrolledCount: number;
  completedQuizzes: number;
  averageScore: number;
}

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ enrolledCount: 0, completedQuizzes: 0, averageScore: 0 });
  const [recentActivity, setRecentActivity] = useState<(Enrollment | Attempt)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [enrollmentsRes, attemptsRes] = await Promise.all([
        fetch('/api/enrollments'),
        fetch('/api/quiz-attempts'),
      ]);

      const enrollmentsData = await enrollmentsRes.json();
      const attemptsData = await attemptsRes.json();

      if (enrollmentsRes.ok && attemptsRes.ok) {
        const enrollments: Enrollment[] = enrollmentsData.enrollments || [];
        const attempts: Attempt[] = attemptsData.attempts || [];

        // Calculate stats
        const completedAttempts = attempts.filter((a) => a.status === 'completed');
        const avgScore = completedAttempts.length > 0
          ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length)
          : 0;

        setStats({
          enrolledCount: enrollments.length,
          completedQuizzes: completedAttempts.length,
          averageScore: avgScore,
        });

        // Combine and sort recent activity
        const activity = [
          ...enrollments.map((e) => ({ ...e, type: 'enrollment' as const })),
          ...attempts
            .filter((a) => a.status === 'completed')
            .map((a) => ({ ...a, type: 'quiz' as const })),
        ].sort((a, b) => {
          const dateA = new Date((a as any).submittedAt || (a as any).enrolledAt || (a as any).startedAt);
          const dateB = new Date((b as any).submittedAt || (b as any).enrolledAt || (b as any).startedAt);
          return dateB.getTime() - dateA.getTime();
        }).slice(0, 5);

        setRecentActivity(activity);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header - Mobile optimized */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome back, <span className="break-words">{session?.user?.name}</span>!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Continue your learning journey. You have access to courses and quizzes.
        </p>
      </div>

      {/* Stats Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Enrolled Courses */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-2.5 sm:p-3">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4 sm:ml-5 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Enrolled Courses</dt>
                  <dd className="mt-1">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.enrolledCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Quizzes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-2.5 sm:p-3">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 sm:ml-5 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Completed Quizzes</dt>
                  <dd className="mt-1">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.completedQuizzes}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white overflow-hidden shadow rounded-lg sm:col-span-2 lg:col-span-1">
          <div className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-2.5 sm:p-3">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 sm:ml-5 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Average Score</dt>
                  <dd className="mt-1">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.averageScore}%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Mobile optimized */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {recentActivity.length === 0 ? (
              <li className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                <p className="text-sm sm:text-base">No recent activity. Start by enrolling in a course!</p>
              </li>
            ) : (
              recentActivity.map((item, index) => (
                <li key={index} className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${
                        (item as any).type === 'enrollment' ? 'bg-indigo-100' : 'bg-green-100'
                      }`}>
                        <span className={(item as any).type === 'enrollment' ? 'text-indigo-600 text-sm sm:text-base' : 'text-green-600 text-sm sm:text-base'}>
                          {(item as any).type === 'enrollment' ? '📚' : '✓'}
                        </span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {(item as any).type === 'enrollment'
                          ? `Enrolled in ${(item as Enrollment).course?.title || 'a course'}`
                          : `Completed quiz: ${(item as Attempt).quiz?.title || 'Quiz'}`}
                      </p>
                      <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                        {(item as any).type === 'enrollment'
                          ? `Progress: ${(item as Enrollment).progress}%`
                          : `Score: ${(item as Attempt).score}%`}
                      </p>
                    </div>
                    {/* Date - Hidden on very small screens, shown on sm+ */}
                    <div className="hidden sm:block flex-shrink-0">
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date((item as any).submittedAt || (item as any).enrolledAt || (item as any).startedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}