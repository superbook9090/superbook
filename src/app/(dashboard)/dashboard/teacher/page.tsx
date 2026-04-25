// src/app/(dashboard)/dashboard/teacher/page.tsx
'use client';

import { useState } from 'react';
import { useSessionStore } from '@/store/useSessionStore';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import useSWR from 'swr';
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
import { Skeleton } from '@/components/ui/Skeleton';
import { fetcher } from '@/lib/swrFetcher';

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

interface Blog {
  _id: string;
  title: string;
  topic: string;
  content: string;
  language: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { _id: string; name: string };
}

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalQuizzes: number;
  totalBlogs: number;
  publishedCourses: number;
}

interface TeacherLimits {
  courses: number;
  quizzes: number;
  blogs: number;
  userLimits?: {
    courses?: number;
    quizzes?: number;
    blogs?: number;
  };
}

export default function TeacherDashboardPage() {
  const session = useSessionStore((s) => s.session) as { user?: { id: string; role: string; name: string } };
  const status = useSessionStore((s) => s.status);
  const { t } = useTranslation();
  const [limitAlert, setLimitAlert] = useState<{ type: 'courses' | 'quizzes' | 'blogs' } | null>(null);

  const isAdmin = session?.user?.role === 'admin';
  const settingsEndpoint = isAdmin ? '/api/admin/settings' : '/api/settings';

  // SWR hooks for data fetching with automatic caching and deduplication
  const { data: coursesData } = useSWR(session ? '/api/courses?instructor=self' : null, fetcher);
  const { data: quizzesData } = useSWR(session ? '/api/quizzes' : null, fetcher);
  const { data: blogsData } = useSWR(session ? '/api/blogs' : null, fetcher);
  const { data: settingsData } = useSWR(session ? settingsEndpoint : null, fetcher);

  // Process data when available
  const courses = coursesData?.courses || [];
  const allQuizzes = quizzesData?.quizzes || [];
  const allBlogs = blogsData?.blogs || [];
  const teacherLimits = settingsData?.teacherLimits || { courses: 5, quizzes: 10, blogs: 10 };

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

  // Calculate total unique students across all courses
  const allStudentIds = new Set<string>();
  courses.forEach((course: Course) => {
    course.enrolledStudents?.forEach((studentId: string) => allStudentIds.add(studentId));
  });

  const publishedCount = courses.filter((c: Course) => c.isPublished).length;

  const stats: Stats = {
    totalCourses: courses.length,
    totalStudents: allStudentIds.size,
    totalQuizzes: teacherQuizzes.length,
    totalBlogs: teacherBlogs.length,
    publishedCourses: publishedCount,
  };

  const limits: TeacherLimits = {
    ...teacherLimits,
    userLimits: {
      courses: undefined,
      quizzes: undefined,
      blogs: undefined,
    },
  };

  const recentCourses = courses.slice(0, 3);

  const getLimit = (type: 'courses' | 'quizzes' | 'blogs') => {
    return limits.userLimits?.[type] || limits[type];
  };

  const getUsagePercentage = (type: 'courses' | 'quizzes' | 'blogs') => {
    const limit = getLimit(type);
    const current = stats[`total${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof Stats] as number;
    return (current / limit) * 100;
  };

  const isNearLimit = (type: 'courses' | 'quizzes' | 'blogs') => {
    const percentage = getUsagePercentage(type);
    return percentage >= 80;
  };

  const isAtLimit = (type: 'courses' | 'quizzes' | 'blogs') => {
    const limit = getLimit(type);
    const current = stats[`total${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof Stats] as number;
    return current >= limit;
  };

  const isLoading = status === 'loading' || !coursesData || !quizzesData || !blogsData || !settingsData;

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--teacher-primary)] to-[var(--teacher-accent)] p-4 sm:p-6 lg:p-8 text-white shadow-xl"
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
                  ? 'bg-[var(--color-muted)] cursor-not-allowed'
                  : 'bg-white hover:shadow-xl'
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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Courses with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--teacher-soft)] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="p-2 sm:p-3 rounded-xl bg-[var(--teacher-soft)] text-[var(--teacher-primary)] w-fit mb-4">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] mb-1">
              {stats.totalCourses} / {getLimit('courses')}
            </div>
            <div className="text-sm text-[var(--color-muted-foreground)] mb-2">{t('dashboard.myCourses')}</div>
            <div className="w-full bg-[var(--border)] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isAtLimit('courses') ? 'bg-[var(--error)]' : isNearLimit('courses') ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'
                }`}
                style={{ width: `${Math.min(getUsagePercentage('courses'), 100)}%` }}
              />
            </div>
            {isNearLimit('courses') && !isAtLimit('courses') && (
              <div className="mt-2 text-xs text-[var(--warning)] font-medium">
                ⚠️ {Math.round(getUsagePercentage('courses'))}% used
              </div>
            )}
          </div>
        </motion.div>

        {/* Total Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--info-light)] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="p-2 sm:p-3 rounded-xl bg-[var(--info-light)] text-[var(--info)] w-fit mb-4">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] mb-1">{stats.totalStudents}</div>
            <div className="text-sm text-[var(--color-muted-foreground)]">{t('dashboard.students')}</div>
          </div>
        </motion.div>

        {/* Quizzes with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--student-soft)] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="p-2 sm:p-3 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)] w-fit mb-4">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] mb-1">
              {stats.totalQuizzes} / {getLimit('quizzes')}
            </div>
            <div className="text-sm text-[var(--color-muted-foreground)] mb-2">{t('dashboard.myQuizzes')}</div>
            <div className="w-full bg-[var(--border)] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isAtLimit('quizzes') ? 'bg-[var(--error)]' : isNearLimit('quizzes') ? 'bg-[var(--warning)]' : 'bg-[var(--student-primary)]'
                }`}
                style={{ width: `${Math.min(getUsagePercentage('quizzes'), 100)}%` }}
              />
            </div>
            {isNearLimit('quizzes') && !isAtLimit('quizzes') && (
              <div className="mt-2 text-xs text-[var(--warning)] font-medium">
                ⚠️ {Math.round(getUsagePercentage('quizzes'))}% used
              </div>
            )}
          </div>
        </motion.div>

        {/* Blogs with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--admin-soft)] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="p-2 sm:p-3 rounded-xl bg-[var(--admin-soft)] text-[var(--admin-primary)] w-fit mb-4">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] mb-1">
              {stats.totalBlogs} / {getLimit('blogs')}
            </div>
            <div className="text-sm text-[var(--color-muted-foreground)] mb-2">{t('dashboard.myBlogs')}</div>
            <div className="w-full bg-[var(--border)] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isAtLimit('blogs') ? 'bg-[var(--error)]' : isNearLimit('blogs') ? 'bg-[var(--warning)]' : 'bg-[var(--admin-primary)]'
                }`}
                style={{ width: `${Math.min(getUsagePercentage('blogs'), 100)}%` }}
              />
            </div>
            {isNearLimit('blogs') && !isAtLimit('blogs') && (
              <div className="mt-2 text-xs text-[var(--warning)] font-medium">
                ⚠️ {Math.round(getUsagePercentage('blogs'))}% used
              </div>
            )}
          </div>
        </motion.div>
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {recentCourses.map((course: Course, index: number) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="group bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
                  {t('dashboard.studentsEnrolled').replace('{count}', String(course.enrolledStudents?.length || 0))}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions - Modern Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl bg-white p-4 sm:p-6 shadow-md"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-4">{t('dashboard.quickActions')}</h2>
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/dashboard/teacher/courses"
            className="flex items-center justify-center sm:justify-start w-full min-h-[44px] p-3 sm:p-4 rounded-xl bg-[var(--teacher-soft)] hover:bg-[var(--teacher-border)] transition-colors group"
          >
            <div className="p-2 sm:p-3 rounded-lg bg-[var(--teacher-primary)]/20 text-[var(--teacher-primary)] group-hover:bg-[var(--teacher-primary)]/30 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="ml-3 text-left">
              <div className="font-semibold text-sm sm:text-base text-[var(--color-foreground)]">{t('dashboard.manageCourses')}</div>
              <div className="text-xs text-[var(--color-muted-foreground)]">{t('dashboard.viewAndEdit')}</div>
            </div>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/dashboard/teacher/quizzes"
            className="flex items-center justify-center sm:justify-start w-full min-h-[44px] p-3 sm:p-4 rounded-xl bg-[var(--student-soft)] hover:bg-[var(--student-border)] transition-colors group"
          >
            <div className="p-2 sm:p-3 rounded-lg bg-[var(--student-primary)]/20 text-[var(--student-primary)] group-hover:bg-[var(--student-primary)]/30 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="ml-3 text-left">
              <div className="font-semibold text-sm sm:text-base text-[var(--color-foreground)]">{t('dashboard.manageQuizzes')}</div>
              <div className="text-xs text-[var(--color-muted-foreground)]">{t('dashboard.createAndReview')}</div>
            </div>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/dashboard/teacher/analytics"
            className="flex items-center justify-center sm:justify-start w-full min-h-[44px] p-3 sm:p-4 rounded-xl bg-[var(--info-light)] hover:bg-[var(--info-light)]/80 transition-colors group"
          >
            <div className="p-2 sm:p-3 rounded-lg bg-[var(--info)]/20 text-[var(--info)] group-hover:bg-[var(--info)]/30 transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="ml-3 text-left">
              <div className="font-semibold text-sm sm:text-base text-[var(--color-foreground)]">{t('dashboard.analytics')}</div>
              <div className="text-xs text-[var(--color-muted-foreground)]">{t('dashboard.viewInsights')}</div>
            </div>
          </motion.a>

          <motion.a
            whileHover={{ scale: stats.totalCourses < limits.courses ? 1.02 : 1 }}
            whileTap={{ scale: stats.totalCourses < limits.courses ? 0.98 : 1 }}
            href={stats.totalCourses < limits.courses ? '/dashboard/teacher/courses/create' : '#'}
            onClick={(e) => {
              if (stats.totalCourses >= limits.courses) {
                e.preventDefault();
                setLimitAlert({ type: 'courses' });
              }
            }}
            className={`flex items-center justify-center sm:justify-start w-full min-h-[44px] p-3 sm:p-4 rounded-xl transition-colors group ${
              stats.totalCourses >= limits.courses
                ? 'bg-[var(--color-muted)] cursor-not-allowed'
                : 'bg-[var(--warning-light)] hover:bg-[var(--warning-light)]/80'
            }`}
          >
            <div className={`p-2 sm:p-3 rounded-lg transition-colors ${
              stats.totalCourses >= limits.courses
                ? 'bg-[var(--color-muted-foreground)] text-[var(--color-muted-foreground)]'
                : 'bg-[var(--warning)]/20 text-[var(--warning)] group-hover:bg-[var(--warning)]/30'
            }`}>
              <Plus className="w-5 h-5" />
            </div>
            <div className="ml-3 text-left">
              <div className={`font-semibold text-sm sm:text-base ${
                stats.totalCourses >= limits.courses ? 'text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'
              }`}>{t('dashboard.createCourse')}</div>
              <div className="text-xs text-[var(--color-muted-foreground)]">{t('dashboard.addNewContent')}</div>
            </div>
          </motion.a>

          <motion.a
            whileHover={{ scale: stats.totalBlogs < limits.blogs ? 1.02 : 1 }}
            whileTap={{ scale: stats.totalBlogs < limits.blogs ? 0.98 : 1 }}
            href={stats.totalBlogs < limits.blogs ? '/dashboard/teacher/blogs/create' : '#'}
            onClick={(e) => {
              if (stats.totalBlogs >= limits.blogs) {
                e.preventDefault();
                setLimitAlert({ type: 'blogs' });
              }
            }}
            className={`flex items-center justify-center sm:justify-start w-full min-h-[44px] p-3 sm:p-4 rounded-xl transition-colors group ${
              stats.totalBlogs >= limits.blogs
                ? 'bg-[var(--color-muted)] cursor-not-allowed'
                : 'bg-[var(--admin-soft)] hover:bg-[var(--admin-border)]'
            }`}
          >
            <div className={`p-2 sm:p-3 rounded-lg transition-colors ${
              stats.totalBlogs >= limits.blogs
                ? 'bg-[var(--color-muted-foreground)] text-[var(--color-muted-foreground)]'
                : 'bg-[var(--admin-primary)]/20 text-[var(--admin-primary)] group-hover:bg-[var(--admin-primary)]/30'
            }`}>
              <Plus className="w-5 h-5" />
            </div>
            <div className="ml-3 text-left">
              <div className={`font-semibold text-sm sm:text-base ${
                stats.totalBlogs >= limits.blogs ? 'text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'
              }`}>{t('dashboard.createBlog')}</div>
              <div className="text-xs text-[var(--color-muted-foreground)]">{t('dashboard.writeNewContent')}</div>
            </div>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
