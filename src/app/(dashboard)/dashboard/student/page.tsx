// src/app/(dashboard)/dashboard/student/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import useSWR from 'swr';
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { fetcher } from '@/lib/swrFetcher';
import { useSessionStore } from '@/store/useSessionStore';
import { Skeleton } from '@/components/ui/Skeleton';

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
  const status = useSessionStore((s) => s.status);
  const { t } = useTranslation();

  // SWR hooks for data fetching with automatic caching and deduplication
  const { data: enrollmentsData } = useSWR(session ? '/api/enrollments' : null, fetcher);
  const { data: attemptsData } = useSWR(session ? '/api/quiz-attempts' : null, fetcher);

  // Process data when available
  const enrollments: Enrollment[] = enrollmentsData?.enrollments || [];
  const attempts: Attempt[] = attemptsData?.attempts || [];

  // Calculate stats
  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const avgScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length)
    : 0;

  const stats: Stats = {
    enrolledCount: enrollments.length,
    completedQuizzes: completedAttempts.length,
    averageScore: avgScore,
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

  const isLoading = status === 'loading' || !enrollmentsData || !attemptsData;

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <Skeleton className="h-12 w-12 mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Recent activity skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] p-4 sm:p-6 lg:p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 truncate">
            {t('dashboard.welcomeBack')}, {session?.user?.name ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1) : session?.user?.name}!
          </h1>
          <p className="text-white/80 text-sm sm:text-base truncate">
            {t('dashboard.continueLearning').replace('{count}', String(stats.enrolledCount))}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards - Modern Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Enrolled Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--student-soft)] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)]">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('common.courses')}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] mb-1">{stats.enrolledCount}</div>
            <div className="text-sm text-[var(--color-muted-foreground)]">{t('dashboard.enrolledCourses')}</div>
          </div>
        </motion.div>

        {/* Completed Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--success-light)] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-[var(--success-light)] text-[var(--success)]">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('common.quizzes')}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] mb-1">{stats.completedQuizzes}</div>
            <div className="text-sm text-[var(--color-muted-foreground)]">{t('dashboard.completedQuizzes')}</div>
          </div>
        </motion.div>

        {/* Average Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--warning-light)] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-[var(--warning-light)] text-[var(--warning)]">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{t('common.performance')}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] mb-1">{stats.averageScore}%</div>
            <div className="text-sm text-[var(--color-muted-foreground)]">{t('dashboard.averageScore')}</div>
            <div className="mt-3 h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--warning)] to-[var(--warning)] rounded-full transition-all duration-500"
                style={{ width: `${stats.averageScore}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity - Modern Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white shadow-md overflow-hidden"
      >
        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">{t('dashboard.recentActivity')}</h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('dashboard.recentActivityDesc')}</p>
          </div>
          <Activity className="w-5 h-5 text-[var(--color-muted-foreground)]" />
        </div>
        <div className="divide-y divide-[var(--border)]">
          {recentActivity.length === 0 ? (
            <div className="px-4 py-8 sm:px-6 sm:py-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-[var(--border)] flex items-center justify-center">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--muted)]" />
              </div>
              <h4 className="text-[var(--color-foreground)] font-medium mb-1">{t('dashboard.noRecentActivity')}</h4>
              <p className="text-sm text-[var(--color-muted-foreground)]">{t('dashboard.startEnrolling')}</p>
            </div>
          ) : (
            recentActivity.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="px-4 py-3 sm:px-6 sm:py-4 flex items-center space-x-3 sm:space-x-4 hover:bg-[var(--background)]/50 transition-colors"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                  item.type === 'enrollment' 
                    ? 'bg-[var(--student-soft)] text-[var(--student-primary)]' 
                    : 'bg-[var(--success-light)] text-[var(--success)]'
                }`}>
                  {item.type === 'enrollment' ? (
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)]">
                    {item.type === 'enrollment'
                      ? t('dashboard.enrolledIn').replace('{title}', item.course?.title || t('common.aCourse'))
                      : t('dashboard.completed').replace('{title}', item.quiz?.title || t('common.quiz'))}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-0.5">
                    {item.type === 'enrollment'
                      ? `${t('dashboard.progress')}: ${item.progress}%`
                      : `${t('dashboard.score')}: ${item.score}%`}
                  </p>
                </div>
                {/* Date */}
                <div className="flex-shrink-0 text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                  {item.type === 'enrollment'
                    ? formatDate(item.enrolledAt)
                    : formatDate(item.submittedAt || item.startedAt)}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}