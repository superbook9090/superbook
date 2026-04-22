// src/app/(dashboard)/dashboard/admin/analytics/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Award,
  BarChart3,
  RefreshCw,
  Activity,
  GraduationCap,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';

interface AdminStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    newThisMonth: number;
    suspended: number;
  };
  courses: {
    total: number;
    published: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
  };
  quizzes: {
    total: number;
    published: number;
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
  };
  blogs: {
    total: number;
    published: number;
  };
  recentActivity: {
    type: string;
    user: string;
    course: string;
    date: string;
  }[];
}

export default function AdminAnalyticsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics?type=admin');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats || null);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load analytics' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error loading analytics' });
      console.error('Analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Auth and role-based redirects handled by middleware and /dashboard/page.tsx

    fetchStats();
  }, [session, status, fetchStats, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <Skeleton className="h-12 w-12 mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Content sections skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Analytics</h1>
            <p className="text-gray-500 mt-1">Overview of platform usage and performance metrics</p>
          </div>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </motion.div>

      {/* Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        </motion.div>
      )}

      {!stats ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-500 mb-4">Try refreshing the page</p>
        </div>
      ) : (
        <>
          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-indigo-600">{stats.users.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total Users</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-blue-600">{stats.users.students}</p>
                <p className="text-sm text-gray-600 mt-1">Students</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-emerald-600">{stats.users.teachers}</p>
                <p className="text-sm text-gray-600 mt-1">Teachers</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-purple-600">{stats.users.admins}</p>
                <p className="text-sm text-gray-600 mt-1">Admins</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-orange-600">{stats.users.newThisMonth}</p>
                <p className="text-sm text-gray-600 mt-1">New This Month</p>
              </div>
            </div>
          </motion.div>

          {/* Content Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Content & Engagement
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-indigo-600">{stats.courses.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total Courses</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-emerald-600">{stats.courses.published}</p>
                <p className="text-sm text-gray-600 mt-1">Published</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-blue-600">{stats.enrollments.total}</p>
                <p className="text-sm text-gray-600 mt-1">Enrollments</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-amber-600">{stats.enrollments.active}</p>
                <p className="text-sm text-gray-600 mt-1">Active</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-violet-600">{stats.quizzes.total}</p>
                <p className="text-sm text-gray-600 mt-1">Quizzes</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-rose-600">{stats.quizzes.totalAttempts}</p>
                <p className="text-sm text-gray-600 mt-1">Quiz Attempts</p>
              </div>
            </div>
          </motion.div>

          {/* Blog Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Blogs
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-indigo-600">{stats.blogs?.total || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Total Blogs</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-emerald-600">{stats.blogs?.published || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Published</p>
              </div>
            </div>
          </motion.div>

          {/* Quiz Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Quiz Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-600 mb-2">Average Score</p>
                <div className="flex items-end">
                  <p className="text-4xl font-bold text-indigo-600">{stats.quizzes.averageScore}%</p>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${theme.gradient} h-2 rounded-full transition-all`}
                    style={{ width: `${stats.quizzes.averageScore}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-600 mb-2">Highest Score</p>
                <p className="text-4xl font-bold text-emerald-600">{stats.quizzes.highestScore}%</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${theme.gradient} h-2 rounded-full transition-all`}
                    style={{ width: `${stats.quizzes.highestScore}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-600 mb-2">Completion Rate</p>
                <p className="text-4xl font-bold text-blue-600">
                  {stats.enrollments.total > 0
                    ? Math.round((stats.enrollments.completed / stats.enrollments.total) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.enrollments.completed} of {stats.enrollments.total} enrollments
                </p>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {stats.recentActivity.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No recent activity</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {stats.recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.user} enrolled in {activity.course}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Enrollment
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
