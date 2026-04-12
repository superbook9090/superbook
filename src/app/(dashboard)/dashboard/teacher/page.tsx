// src/app/(dashboard)/dashboard/teacher/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Course {
  _id: string;
  title: string;
  enrolledStudents: string[];
  isPublished: boolean;
}

interface Quiz {
  _id: string;
  title: string;
  isPublished: boolean;
  course: { _id: string } | string;
}

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalQuizzes: number;
  publishedCourses: number;
}

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    publishedCourses: 0,
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, quizzesRes] = await Promise.all([
        fetch('/api/courses?instructor=self'),
        fetch('/api/quizzes'),
      ]);

      const coursesData = await coursesRes.json();
      const quizzesData = await quizzesRes.json();

      if (coursesRes.ok && quizzesRes.ok) {
        const courses: Course[] = coursesData.courses || [];
        const allQuizzes: Quiz[] = quizzesData.quizzes || [];

        // Filter quizzes for this teacher's courses
        const courseIds = new Set(courses.map((c) => c._id.toString()));
        const teacherQuizzes = allQuizzes.filter((q) => {
          const quizCourseId = typeof q.course === 'object' && q.course !== null
            ? q.course._id?.toString()
            : q.course?.toString();
          return quizCourseId && courseIds.has(quizCourseId);
        });

        // Calculate total unique students across all courses
        const allStudentIds = new Set<string>();
        courses.forEach((course) => {
          course.enrolledStudents?.forEach((studentId) => allStudentIds.add(studentId));
        });

        const publishedCount = courses.filter((c) => c.isPublished).length;

        setStats({
          totalCourses: courses.length,
          totalStudents: allStudentIds.size,
          totalQuizzes: teacherQuizzes.length,
          publishedCourses: publishedCount,
        });

        // Get 3 most recent courses
        setRecentCourses(courses.slice(0, 3));
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
      {/* Header - Mobile optimized */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Welcome back, <span className="break-words">{session?.user?.name}</span>! Manage your courses and quizzes here.
        </p>
      </div>

      {/* Stats Cards - Responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* My Courses */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-2 sm:p-2.5 lg:p-3">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">My Courses</dt>
                  <dd className="mt-0.5">
                    <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.totalCourses}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-2 sm:p-2.5 lg:p-3">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">Students</dt>
                  <dd className="mt-0.5">
                    <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.totalStudents}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quizzes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-2 sm:p-2.5 lg:p-3">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">Quizzes</dt>
                  <dd className="mt-0.5">
                    <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.totalQuizzes}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Published */}
        <div className="bg-white overflow-hidden shadow rounded-lg col-span-2 sm:col-span-1">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-2 sm:p-2.5 lg:p-3">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">Published</dt>
                  <dd className="mt-0.5">
                    <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.publishedCourses}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Courses - Mobile optimized */}
      {recentCourses.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Courses</h2>
          <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {recentCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{course.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {course.enrolledStudents?.length || 0} students enrolled
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions - Mobile optimized */}
      <div>
        <h2 className="text-base sm:text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <a
            href="/dashboard/teacher/courses"
            className="inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 touch-manipulation"
          >
            Manage Courses
          </a>
          <a
            href="/dashboard/teacher/quizzes"
            className="inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 touch-manipulation"
          >
            Manage Quizzes
          </a>
        </div>
      </div>
    </div>
  );
}
