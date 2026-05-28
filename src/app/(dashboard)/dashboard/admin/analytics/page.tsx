// src/app/(dashboard)/dashboard/admin/analytics/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import StatCard from '@/components/ui/StatCard';
import ActivityCard from '@/components/ui/ActivityCard';
import { PageWrapper, PageHeader } from '@/components/layout';

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
      router.push(ROUTES.login);
      return;
    }

    // Auth and role-based redirects handled by middleware and /dashboard/page.tsx

    fetchStats();
  }, [session, status, fetchStats, router]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper className="overflow-x-hidden">
      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="p-3 bg-[var(--info-light)] rounded-xl">
              <BarChart3 className="w-6 h-6 text-[var(--info)]" />
            </span>
            {t('progress.systemAnalytics')}
          </span>
        }
        description={t('progress.overviewDescription')}
        actions={
          <button
            type="button"
            onClick={fetchStats}
            className="btn-action bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-sm hover:shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            {t('progress.refresh')}
          </button>
        }
      />

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
              <StatCard
                icon={Users}
                value={stats.users.total}
                label={t('progress.totalUsers')}
                color="info"
                delay={0.1}
              />
              <StatCard
                icon={Users}
                value={stats.users.students}
                label={t('progress.students')}
                color="student"
                delay={0.15}
              />
              <StatCard
                icon={Users}
                value={stats.users.teachers}
                label={t('progress.teachers')}
                color="success"
                delay={0.2}
              />
              <StatCard
                icon={Users}
                value={stats.users.admins}
                label={t('progress.admins')}
                color="admin"
                delay={0.25}
              />
              <StatCard
                icon={Users}
                value={stats.users.newThisMonth}
                label={t('progress.newThisMonth')}
                color="warning"
                delay={0.3}
              />
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
              <StatCard
                icon={BookOpen}
                value={stats.courses.total}
                label={t('progress.totalCourses')}
                color="info"
                delay={0.1}
              />
              <StatCard
                icon={BookOpen}
                value={stats.courses.published}
                label={t('progress.published')}
                color="success"
                delay={0.15}
              />
              <StatCard
                icon={BookOpen}
                value={stats.enrollments.total}
                label={t('progress.enrollments')}
                color="student"
                delay={0.2}
              />
              <StatCard
                icon={BookOpen}
                value={stats.enrollments.active}
                label={t('progress.activeEnrollments')}
                color="warning"
                delay={0.25}
              />
              <StatCard
                icon={BookOpen}
                value={stats.quizzes.total}
                label={t('common.quizzes')}
                color="student"
                delay={0.3}
              />
              <StatCard
                icon={BookOpen}
                value={stats.quizzes.totalAttempts}
                label={t('analytics.quizAttempts')}
                color="admin"
                delay={0.35}
              />
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
              <StatCard
                icon={BookOpen}
                value={stats.blogs?.total || 0}
                label={t('progress.totalBlogs')}
                color="info"
                delay={0.1}
              />
              <StatCard
                icon={BookOpen}
                value={stats.blogs?.published || 0}
                label={t('progress.published')}
                color="success"
                delay={0.15}
              />
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
              <StatCard
                icon={Award}
                value={stats.quizzes.averageScore}
                label={t('analytics.averageScore')}
                color="info"
                delay={0.1}
                suffix="%"
                showProgress={true}
                progress={stats.quizzes.averageScore}
              />
              <StatCard
                icon={Award}
                value={stats.quizzes.highestScore}
                label={t('progress.highestScore')}
                color="success"
                delay={0.15}
                suffix="%"
                showProgress={true}
                progress={stats.quizzes.highestScore}
              />
              <StatCard
                icon={Award}
                value={stats.enrollments.total > 0 ? Math.round((stats.enrollments.completed / stats.enrollments.total) * 100) : 0}
                label={t('progress.completionRate')}
                color="student"
                delay={0.2}
                suffix="%"
                description={t('progress.ofEnrollments', { completed: stats.enrollments.completed, total: stats.enrollments.total })}
                showProgress={true}
                progress={stats.enrollments.total > 0 ? Math.round((stats.enrollments.completed / stats.enrollments.total) * 100) : 0}
              />
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
                    <ActivityCard
                      key={index}
                      icon={GraduationCap}
                      title={t('progress.enrolledIn', { user: activity.user, course: activity.course })}
                      description={t('progress.enrollment')}
                      date={formatDateTime(activity.date)}
                      color="info"
                      delay={0.5 + index * 0.05}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </PageWrapper>
  );
}
