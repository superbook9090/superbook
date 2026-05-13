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
import { PageSkeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '@/lib/dateUtils';
import { fetchAnalytics } from '@/lib/api/analytics';
import { ApiClientError } from '@/lib/api/http';

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
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = (await fetchAnalytics('admin')) as { stats?: AdminStats };
      setStats(data.stats || null);
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err instanceof ApiClientError ? err.message : t('errors.errorLoadingAnalytics'),
      });
      console.error('Analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

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
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--info-light)] rounded-xl">
            <BarChart3 className="w-6 h-6 text-[var(--info)]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('progress.systemAnalytics')}</h1>
            <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('progress.overviewDescription')}</p>
          </div>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base bg-[var(--card-solid)] text-[var(--color-foreground)] rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('progress.refresh')}
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
        <div className="text-center py-16 bg-[var(--card-solid)] rounded-2xl shadow-sm">
          <BarChart3 className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">{t('progress.noDataAvailable')}</h3>
          <p className="text-[var(--color-muted-foreground)] mb-4">{t('progress.tryRefreshing')}</p>
        </div>
      ) : (
        <>
          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('common.users')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--info)]">{stats.users.total}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.totalUsers')}</p>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--student-primary)]">{stats.users.students}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.students')}</p>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--success)]">{stats.users.teachers}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.teachers')}</p>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--primary)]">{stats.users.admins}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.admins')}</p>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--warning)]">{stats.users.newThisMonth}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.newThisMonth')}</p>
              </div>
            </div>
          </motion.div>

          {/* Content Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('progress.contentEngagement')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--info)]">{stats.courses.total}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.totalCourses')}</p>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--success)]">{stats.courses.published}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.published')}</p>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--student-primary)]">{stats.enrollments.total}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.enrollments')}</p>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--warning)]">{stats.enrollments.active}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.activeEnrollments')}</p>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--student-accent)]">{stats.quizzes.total}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('common.quizzes')}</p>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--primary)]">{stats.quizzes.totalAttempts}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('analytics.quizAttempts')}</p>
              </div>
            </div>
          </motion.div>

          {/* Blog Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('common.blogs')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--info)]">{stats.blogs?.total || 0}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.totalBlogs')}</p>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-[var(--success)]">{stats.blogs?.published || 0}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('progress.published')}</p>
              </div>
            </div>
          </motion.div>

          {/* Quiz Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              {t('progress.quizPerformance')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <p className="text-sm text-[var(--color-muted-foreground)] mb-2">{t('analytics.averageScore')}</p>
                <div className="flex items-end">
                  <p className="text-4xl font-bold text-[var(--info)]">{stats.quizzes.averageScore}%</p>
                </div>
                <div className="mt-4 w-full bg-[var(--border)] rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${theme.gradient} h-2 rounded-full transition-all`}
                    style={{ width: `${stats.quizzes.averageScore}%` }}
                  />
                </div>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <p className="text-sm text-[var(--color-muted-foreground)] mb-2">{t('progress.highestScore')}</p>
                <p className="text-4xl font-bold text-[var(--success)]">{stats.quizzes.highestScore}%</p>
                <div className="mt-4 w-full bg-[var(--border)] rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${theme.gradient} h-2 rounded-full transition-all`}
                    style={{ width: `${stats.quizzes.highestScore}%` }}
                  />
                </div>
              </div>
              <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <p className="text-sm text-[var(--color-muted-foreground)] mb-2">{t('progress.completionRate')}</p>
                <p className="text-4xl font-bold text-[var(--student-primary)]">
                  {stats.enrollments.total > 0
                    ? Math.round((stats.enrollments.completed / stats.enrollments.total) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
                  {t('progress.ofEnrollments', { completed: stats.enrollments.completed, total: stats.enrollments.total })}
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
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('progress.recentActivity')}
            </h2>
            <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm overflow-hidden">
              {stats.recentActivity.length === 0 ? (
                <p className="p-6 text-[var(--color-muted-foreground)] text-center">{t('progress.noRecentActivity')}</p>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {stats.recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="p-4 flex items-center justify-between hover:bg-[var(--color-muted)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[var(--info-light)] text-[var(--info)]">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-foreground)]">
                            {t('progress.enrolledIn', { user: activity.user, course: activity.course })}
                          </p>
                          <p className="text-xs text-[var(--color-muted-foreground)]">
                            {formatDateTime(activity.date)}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--info-light)] text-[var(--info)]">
                        {t('progress.enrollment')}
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
