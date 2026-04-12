// src/app/(dashboard)/dashboard/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AdminStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    newThisMonth: number;
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
  recentActivity: {
    type: string;
    user: string;
    course: string;
    date: string;
  }[];
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics?type=admin');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats || null);
      } else {
        setError(data.message || 'Failed to load analytics');
      }
    } catch (err) {
      setError('Error loading analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
      <p className="mt-2 text-gray-600">
        Overview of platform usage and performance metrics.
      </p>

      {/* User Stats */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.users.total}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.users.students}</p>
            <p className="text-sm text-gray-600">Students</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.users.teachers}</p>
            <p className="text-sm text-gray-600">Teachers</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.users.admins}</p>
            <p className="text-sm text-gray-600">Admins</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.users.newThisMonth}</p>
            <p className="text-sm text-gray-600">New This Month</p>
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content & Engagement</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.courses.total}</p>
            <p className="text-sm text-gray-600">Total Courses</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.courses.published}</p>
            <p className="text-sm text-gray-600">Published</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.enrollments.total}</p>
            <p className="text-sm text-gray-600">Enrollments</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.enrollments.active}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.quizzes.total}</p>
            <p className="text-sm text-gray-600">Quizzes</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-pink-600">{stats.quizzes.totalAttempts}</p>
            <p className="text-sm text-gray-600">Quiz Attempts</p>
          </div>
        </div>
      </div>

      {/* Quiz Performance */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Average Score</p>
            <div className="flex items-end">
              <p className="text-4xl font-bold text-indigo-600">{stats.quizzes.averageScore}%</p>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${stats.quizzes.averageScore}%` }}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Highest Score</p>
            <p className="text-4xl font-bold text-green-600">{stats.quizzes.highestScore}%</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats.quizzes.highestScore}%` }}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
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
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {stats.recentActivity.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No recent activity</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user} enrolled in {activity.course}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Enrollment
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
