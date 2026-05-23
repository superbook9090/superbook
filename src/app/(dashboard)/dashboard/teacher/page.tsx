// src/app/(dashboard)/dashboard/teacher/page.tsx
'use client';

import { useState } from 'react';
import { useSessionStore } from '@/store/useSessionStore';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useDashboard,
  isTeacherDashboard,
  type TeacherDashboardData,
} from '@/lib/react-query/hooks';
import {
  BookOpen,
  Users,
  HelpCircle,
  Plus,
  ArrowRight,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { PageSkeleton } from '@/components/ui/Skeleton';
import StatCard from '@/components/ui/StatCard';
import QuickActionCard from '@/components/ui/QuickActionCard';
import { PageWrapper, ResponsiveGrid } from '@/components/layout';

// Types are now imported from hooks
interface Course {
  _id: string;
  title: string;
  enrolledCount?: number;
  isPublished: boolean;
}

interface Quiz {
  _id: string;
  title: string;
  isPublished: boolean;
  course: { _id: string } | string;
}

interface Blog {
  _id: string;
  title: string;
  topic: string;
  content?: string;
  language: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { _id: string; name: string };
}

// Use the type from the API response
type Stats = TeacherDashboardData['stats'];
type TeacherLimits = TeacherDashboardData['limits'];

export default function TeacherDashboardPage() {
  const session = useSessionStore((s) => s.session) as { user?: { id: string; role: string; name: string } };
  const { t } = useTranslation();
  const [limitAlert, setLimitAlert] = useState<{ type: 'courses' | 'quizzes' | 'blogs' } | null>(null);

  // Single React Query call replaces multiple SWR calls
  const { data, isLoading, error } = useDashboard();

  // Type guard to ensure we have teacher data
  const dashboardData = data && isTeacherDashboard(data) ? data : null;

  // Extract data from the consolidated API response
  const courses: Course[] = dashboardData?.courses || [];
  const allQuizzes: Quiz[] = dashboardData?.quizzes || [];
  const allBlogs: Blog[] = dashboardData?.blogs || [];
  const stats: Stats = dashboardData?.stats || {
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    totalBlogs: 0,
    publishedCourses: 0,
  };
  const limits: TeacherLimits = dashboardData?.limits || {
    courses: 5,
    quizzes: 10,
    blogs: 10,
    userLimits: {},
  };

  // Filter quizzes for this teacher's courses
  const courseIds = new Set(courses.map((c: Course) => c._id.toString()));
  const teacherQuizzes = allQuizzes.filter((q: Quiz) => {
    const quizCourseId = typeof q.course === 'object' && q.course !== null
      ? q.course._id?.toString()
      : q.course?.toString();
    return quizCourseId && courseIds.has(quizCourseId);
  });

  // Filter blogs for this teacher
  const teacherBlogs = allBlogs.filter((b: Blog) => b.author?._id === session?.user?.id);

  // Update stats with filtered counts
  const filteredStats: Stats = {
    ...stats,
    totalQuizzes: teacherQuizzes.length,
    totalBlogs: teacherBlogs.length,
  };

  const recentCourses = courses.slice(0, 3);

  const getLimit = (type: 'courses' | 'quizzes' | 'blogs') => {
    return limits.userLimits?.[type] || limits[type];
  };

  const getUsagePercentage = (type: 'courses' | 'quizzes' | 'blogs') => {
    const limit = getLimit(type);
    const current = filteredStats[`total${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof Stats] as number;
    return (current / limit) * 100;
  };

  const isNearLimit = (type: 'courses' | 'quizzes' | 'blogs') => {
    const percentage = getUsagePercentage(type);
    return percentage >= 80;
  };

  const isAtLimit = (type: 'courses' | 'quizzes' | 'blogs') => {
    const limit = getLimit(type);
    const current = filteredStats[`total${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof Stats] as number;
    return current >= limit;
  };

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
        className="hero-banner bg-gradient-to-r from-[var(--teacher-primary)] to-[var(--teacher-accent)] text-white"
      >
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 truncate">
              {t('dashboard.teacherDashboard')}
            </h1>
            <p className="text-white/80 text-sm sm:text-base truncate">
              {t('dashboard.welcomeBack')}, {session?.user?.name ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1) : session?.user?.name}! {t('dashboard.manageContent')}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <motion.a
              whileHover={{ scale: !isAtLimit('courses') ? 1.02 : 1 }}
              whileTap={{ scale: !isAtLimit('courses') ? 0.98 : 1 }}
              href={!isAtLimit('courses') ? '/dashboard/teacher/courses/create' : '#'}
              onClick={(e) => {
                if (isAtLimit('courses')) {
                  e.preventDefault();
                  setLimitAlert({ type: 'courses' });
                }
              }}
              className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base text-[var(--teacher-primary)] rounded-xl font-semibold shadow-lg transition-all ${
                isAtLimit('courses')
                  ? 'bg-[var(--color-surface-muted)] cursor-not-allowed'
                  : 'bg-[var(--card-solid)] hover:shadow-xl'
              }`}
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('dashboard.createCourse')}
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Limit Alert */}
      {limitAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            type="error"
            message={t('dashboard.limitReached').replace('{type}', limitAlert.type).replace('{limit}', String(getLimit(limitAlert.type)))}
            onClose={() => setLimitAlert(null)}
          />
        </motion.div>
      )}

      {/* Stats Cards - Modern Design */}
      <ResponsiveGrid variant="stats">
        <StatCard
          icon={BookOpen}
          value={`${stats.totalCourses} / ${getLimit('courses')}`}
          label={t('dashboard.myCourses')}
          color="teacher"
          delay={0.1}
          showProgress={true}
          progress={getUsagePercentage('courses')}
          description={isNearLimit('courses') && !isAtLimit('courses') ? `⚠️ ${Math.round(getUsagePercentage('courses'))}% used` : undefined}
        />
        <StatCard
          icon={Users}
          value={stats.totalStudents}
          label={t('dashboard.students')}
          color="info"
          delay={0.2}
        />
        <StatCard
          icon={HelpCircle}
          value={`${filteredStats.totalQuizzes} / ${getLimit('quizzes')}`}
          label={t('dashboard.myQuizzes')}
          color="student"
          delay={0.3}
          showProgress={true}
          progress={getUsagePercentage('quizzes')}
          description={isNearLimit('quizzes') && !isAtLimit('quizzes') ? `⚠️ ${Math.round(getUsagePercentage('quizzes'))}% used` : undefined}
        />
        <StatCard
          icon={BarChart3}
          value={`${filteredStats.totalBlogs} / ${getLimit('blogs')}`}
          label={t('dashboard.myBlogs')}
          color="admin"
          delay={0.4}
          showProgress={true}
          progress={getUsagePercentage('blogs')}
          description={isNearLimit('blogs') && !isAtLimit('blogs') ? `⚠️ ${Math.round(getUsagePercentage('blogs'))}% used` : undefined}
        />
      </ResponsiveGrid>

      {/* Recent Courses - Modern Design */}
      {recentCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)]">{t('dashboard.recentCourses')}</h2>
            <a 
              href="/dashboard/teacher/courses" 
              className="text-sm font-medium text-[var(--teacher-primary)] hover:text-[var(--teacher-hover)] flex items-center"
            >
              {t('dashboard.viewAll')} <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <ResponsiveGrid variant="cards">
            {recentCourses.map((course: Course, index: number) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="group card-surface card-body hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-[var(--teacher-primary)] to-[var(--teacher-accent)] text-white">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  {course.isPublished && (
                    <span className="px-2 py-1 text-xs font-medium bg-[var(--teacher-soft)] text-[var(--teacher-primary)] rounded-full">
                      {t('dashboard.published')}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-[var(--color-foreground)] mb-1 truncate">{course.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                  {t('dashboard.studentsEnrolled').replace('{count}', String(course.enrolledCount || 0))}
                </p>
              </motion.div>
            ))}
          </ResponsiveGrid>
        </motion.div>
      )}

      {/* Quick Actions - Modern Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-surface card-body"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-4">{t('dashboard.quickActions')}</h2>
        <ResponsiveGrid variant="stats">
          <QuickActionCard
            icon={BookOpen}
            title={t('dashboard.manageCourses')}
            description={t('dashboard.viewAndEdit')}
            href="/dashboard/teacher/courses"
            color="teacher"
            delay={0.1}
          />
          <QuickActionCard
            icon={HelpCircle}
            title={t('dashboard.manageQuizzes')}
            description={t('dashboard.createAndReview')}
            href="/dashboard/teacher/quizzes"
            color="student"
            delay={0.15}
          />
          <QuickActionCard
            icon={BarChart3}
            title={t('dashboard.analytics')}
            description={t('dashboard.viewInsights')}
            href="/dashboard/teacher/analytics"
            color="info"
            delay={0.2}
          />
          <QuickActionCard
            icon={Plus}
            title={t('dashboard.createCourse')}
            description={t('dashboard.addNewContent')}
            href={filteredStats.totalCourses < limits.courses ? '/dashboard/teacher/courses/create' : '#'}
            color="warning"
            disabled={filteredStats.totalCourses >= limits.courses}
            delay={0.25}
          />
          <QuickActionCard
            icon={Plus}
            title={t('dashboard.createBlog')}
            description={t('dashboard.writeNewContent')}
            href={filteredStats.totalBlogs < limits.blogs ? '/dashboard/teacher/blogs/create' : '#'}
            color="admin"
            disabled={filteredStats.totalBlogs >= limits.blogs}
            delay={0.3}
          />
        </ResponsiveGrid>
      </motion.div>
    </PageWrapper>
  );
}
