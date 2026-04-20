// src/app/(dashboard)/dashboard/student/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import Loader from '@/components/ui/Loader';

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
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
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

  const recentActivity = activity
    .sort((a, b) => getActivityDate(b) - getActivityDate(a))
    .slice(0, 5);

  const isLoading = status === 'loading' || !enrollmentsData || !attemptsData;

  if (isLoading) {
    return <Loader variant="inline" size="lg" text={t('common.loading')} />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {t('dashboard.welcomeBack')}, {session?.user?.name}!
          </h1>
          <p className="text-indigo-100 text-lg">
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
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Courses</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.enrolledCount}</div>
            <div className="text-sm text-gray-500">{t('dashboard.enrolledCourses')}</div>
          </div>
        </motion.div>

        {/* Completed Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Quizzes</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completedQuizzes}</div>
            <div className="text-sm text-gray-500">{t('dashboard.completedQuizzes')}</div>
          </div>
        </motion.div>

        {/* Average Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Performance</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.averageScore}%</div>
            <div className="text-sm text-gray-500">{t('dashboard.averageScore')}</div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
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
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.recentActivity')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('dashboard.recentActivityDesc')}</p>
          </div>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-gray-900 font-medium mb-1">{t('dashboard.noRecentActivity')}</h4>
              <p className="text-sm text-gray-500">{t('dashboard.startEnrolling')}</p>
            </div>
          ) : (
            recentActivity.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50/50 transition-colors"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  item.type === 'enrollment' 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {item.type === 'enrollment' ? (
                    <BookOpen className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.type === 'enrollment'
                      ? t('dashboard.enrolledIn').replace('{title}', item.course?.title || 'a course')
                      : t('dashboard.completed').replace('{title}', item.quiz?.title || 'Quiz')}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {item.type === 'enrollment'
                      ? `${t('dashboard.progress')}: ${item.progress}%`
                      : `${t('dashboard.score')}: ${item.score}%`}
                  </p>
                </div>
                {/* Date */}
                <div className="flex-shrink-0 text-sm text-gray-400">
                  {item.type === 'enrollment'
                    ? new Date(item.enrolledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : new Date(item.submittedAt || item.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}