// src/app/(dashboard)/dashboard/student/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useDashboard,
  isStudentDashboard,
} from '@/lib/react-query/hooks';
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useSessionStore } from '@/store/useSessionStore';
import StatCard from '@/components/ui/StatCard';
import ActivityCard from '@/components/ui/ActivityCard';
import { PageWrapper, ResponsiveGrid } from '@/components/layout';

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
  type?: 'quiz';
}

// Extended enrollment with type for activity union
interface EnrollmentActivity extends Enrollment {
  type: 'enrollment';
}

// Extended attempt with type for activity union
interface AttemptActivity extends Attempt {
  type: 'quiz';
}

// Union type for recent activity
type ActivityItem = EnrollmentActivity | AttemptActivity;

interface Stats {
  enrolledCount: number;
  completedQuizzes: number;
  averageScore: number;
}

export default function StudentDashboardPage() {
  const session = useSessionStore((s) => s.session) as { user?: { name: string } };
  const { t } = useTranslation();

  // Single React Query call replaces multiple SWR calls
  const { data, isLoading, error } = useDashboard();

  // Type guard to ensure we have student data
  const dashboardData = data && isStudentDashboard(data) ? data : null;

  // Extract data from the consolidated API response
  const enrollments: Enrollment[] = dashboardData?.enrollments || [];
  const attempts: Attempt[] = dashboardData?.quizAttempts || [];

  // Get pre-calculated stats from API
  const stats: Stats = dashboardData?.stats || {
    enrolledCount: 0,
    completedQuizzes: 0,
    averageScore: 0,
  };

  // Combine and sort recent activity
  const activity: ActivityItem[] = [
    ...enrollments.map((e) => ({ ...e, type: 'enrollment' as const })),
    ...attempts
      .filter((a) => a.status === 'completed')
      .map((a) => ({ ...a, type: 'quiz' as const })),
  ];

  // Helper to get date from activity item
  const getActivityDate = (item: ActivityItem): number => {
    if (item.type === 'quiz') {
      return new Date(item.submittedAt || item.startedAt).getTime();
    }
    return new Date(item.enrolledAt).getTime();
  };

  // Helper to safely format date with time
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return t('common.notAvailable');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('common.notAvailable');

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
             ', ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
  };

  const recentActivity = activity
    .sort((a, b) => getActivityDate(b) - getActivityDate(a))
    .slice(0, 5);

  // Error state
  if (error) {
    return (
      <PageWrapper>
        <Alert
          type="error"
          message={error.message || t('errors.failedLoadDashboardData')}
        />
      </PageWrapper>
    );
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner"
      >
        <div>
          <h1 className="heading-xl mb-2 truncate">
            {t('dashboard.welcomeBack')},{' '}
            <span className="gradient-text">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1) : session?.user?.name}
            </span>!
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-sm sm:text-base truncate">
            {t('dashboard.continueLearning').replace('{count}', String(stats.enrolledCount))}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards - Modern Design */}
      <ResponsiveGrid variant="cards">
        <StatCard
          icon={BookOpen}
          value={stats.enrolledCount}
          label={t('dashboard.enrolledCourses')}
          color="student"
          delay={0.1}
        />
        <StatCard
          icon={CheckCircle}
          value={stats.completedQuizzes}
          label={t('dashboard.completedQuizzes')}
          color="success"
          delay={0.2}
        />
        <StatCard
          icon={TrendingUp}
          value={stats.averageScore}
          label={t('dashboard.averageScore')}
          color="warning"
          delay={0.3}
          suffix="%"
          showProgress={true}
          progress={stats.averageScore}
        />
      </ResponsiveGrid>

      {/* Recent Activity - Modern Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-panel"
      >
        <div className="card-panel-header flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">{t('dashboard.recentActivity')}</h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('dashboard.recentActivityDesc')}</p>
          </div>
          <Activity className="w-5 h-5 text-[var(--color-muted-foreground)]" />
        </div>
        <div className="divide-y divide-[var(--border)]">
          {recentActivity.length === 0 ? (
            <div className="card-panel-body text-center py-[var(--space-10)]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-[var(--border)] flex items-center justify-center">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--muted)]" />
              </div>
              <h4 className="text-[var(--color-foreground)] font-medium mb-1">{t('dashboard.noRecentActivity')}</h4>
              <p className="text-sm text-[var(--color-muted-foreground)]">{t('dashboard.startEnrolling')}</p>
            </div>
          ) : (
            recentActivity.map((item, index) => (
              <ActivityCard
                key={index}
                icon={item.type === 'enrollment' ? BookOpen : CheckCircle}
                title={
                  item.type === 'enrollment'
                    ? t('dashboard.enrolledIn').replace('{title}', item.course?.title || t('common.aCourse'))
                    : t('dashboard.completed').replace('{title}', item.quiz?.title || t('common.quiz'))
                }
                description={
                  item.type === 'enrollment'
                    ? `${t('dashboard.progress')}: ${item.progress}%`
                    : `${t('dashboard.score')}: ${item.score}%`
                }
                date={
                  item.type === 'enrollment'
                    ? formatDate(item.enrolledAt)
                    : formatDate(item.submittedAt || item.startedAt)
                }
                color={item.type === 'enrollment' ? 'student' : 'success'}
                delay={0.5 + index * 0.05}
              />
            ))
          )}
        </div>
      </motion.div>
    </PageWrapper>
  );
}