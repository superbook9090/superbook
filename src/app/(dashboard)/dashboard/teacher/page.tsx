// src/app/(dashboard)/dashboard/teacher/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  BookOpen,
  Users,
  HelpCircle,
  CheckCircle,
  Plus,
  ArrowRight,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import Alert from '@/components/ui/Alert';

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
  totalBlogs: number;
  publishedCourses: number;
}

interface TeacherLimits {
  courses: number;
  quizzes: number;
  blogs: number;
}

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    totalBlogs: 0,
    publishedCourses: 0,
  });
  const [limits, setLimits] = useState<TeacherLimits>({
    courses: 5,
    quizzes: 10,
    blogs: 10,
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limitAlert, setLimitAlert] = useState<{ type: 'courses' | 'quizzes' | 'blogs' } | null>(null);

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
      const [coursesRes, quizzesRes, blogsRes, settingsRes] = await Promise.all([
        fetch('/api/courses?instructor=self'),
        fetch('/api/quizzes'),
        fetch('/api/blogs'),
        fetch('/api/admin/settings'),
      ]);

      const coursesData = await coursesRes.json();
      const quizzesData = await quizzesRes.json();
      const blogsData = await blogsRes.json();
      const settingsData = await settingsRes.json();

      if (coursesRes.ok && quizzesRes.ok && blogsRes.ok) {
        const courses: Course[] = coursesData.courses || [];
        const allQuizzes: Quiz[] = quizzesData.quizzes || [];
        const allBlogs: any[] = blogsData.blogs || [];

        // Filter quizzes for this teacher's courses
        const courseIds = new Set(courses.map((c) => c._id.toString()));
        const teacherQuizzes = allQuizzes.filter((q) => {
          const quizCourseId = typeof q.course === 'object' && q.course !== null
            ? q.course._id?.toString()
            : q.course?.toString();
          return quizCourseId && courseIds.has(quizCourseId);
        });

        // Filter blogs for this teacher
        const teacherBlogs = allBlogs.filter((b) => b.author?._id === session?.user?.id);

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
          totalBlogs: teacherBlogs.length,
          publishedCourses: publishedCount,
        });

        // Get 3 most recent courses
        setRecentCourses(courses.slice(0, 3));

        // Set limits if admin settings are available
        if (settingsRes.ok && settingsData.teacherLimits) {
          setLimits(settingsData.teacherLimits);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('common.loading')}</p>
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('dashboard.teacherDashboard')}
            </h1>
            <p className="text-emerald-100 text-lg">
              {t('dashboard.welcomeBack')}, {session?.user?.name}! {t('dashboard.manageContent')}
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
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
              className={`inline-flex items-center px-4 py-2.5 text-emerald-700 rounded-xl font-semibold shadow-lg transition-all ${
                stats.totalCourses >= limits.courses
                  ? 'bg-gray-300 cursor-not-allowed'
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
            message={`You have reached your ${limitAlert.type} limit (${limits[limitAlert.type]}). Please delete some ${limitAlert.type} or contact admin.`}
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
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 w-fit mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalCourses} / {limits.courses}
            </div>
            <div className="text-sm text-gray-500 mb-2">{t('dashboard.myCourses')}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  stats.totalCourses >= limits.courses ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min((stats.totalCourses / limits.courses) * 100, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Total Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 w-fit mb-4">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalStudents}</div>
            <div className="text-sm text-gray-500">{t('dashboard.students')}</div>
          </div>
        </motion.div>

        {/* Quizzes with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="p-3 rounded-xl bg-violet-100 text-violet-600 w-fit mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalQuizzes} / {limits.quizzes}
            </div>
            <div className="text-sm text-gray-500 mb-2">{t('nav.quizzes')}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  stats.totalQuizzes >= limits.quizzes ? 'bg-red-500' : 'bg-violet-500'
                }`}
                style={{ width: `${Math.min((stats.totalQuizzes / limits.quizzes) * 100, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Blogs with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="p-3 rounded-xl bg-rose-100 text-rose-600 w-fit mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalBlogs} / {limits.blogs}
            </div>
            <div className="text-sm text-gray-500 mb-2">Blogs</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  stats.totalBlogs >= limits.blogs ? 'bg-red-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min((stats.totalBlogs / limits.blogs) * 100, 100)}%` }}
              />
            </div>
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
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.recentCourses')}</h2>
            <a 
              href="/dashboard/teacher/courses" 
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
            >
              {t('dashboard.viewAll')} <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {recentCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  {course.isPublished && (
                    <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                      {t('dashboard.published')}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{course.title}</h3>
                <p className="text-sm text-gray-500">
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
        className="rounded-2xl bg-white p-6 shadow-md"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/dashboard/teacher/courses"
            className="flex items-center p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group"
          >
            <div className="p-3 rounded-lg bg-emerald-200 text-emerald-700 group-hover:bg-emerald-300 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <div className="font-semibold text-gray-900">{t('dashboard.manageCourses')}</div>
              <div className="text-sm text-gray-500">{t('dashboard.viewAndEdit')}</div>
            </div>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/dashboard/teacher/quizzes"
            className="flex items-center p-4 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors group"
          >
            <div className="p-3 rounded-lg bg-violet-200 text-violet-700 group-hover:bg-violet-300 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <div className="font-semibold text-gray-900">{t('dashboard.manageQuizzes')}</div>
              <div className="text-sm text-gray-500">{t('dashboard.createAndReview')}</div>
            </div>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/dashboard/teacher/analytics"
            className="flex items-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
          >
            <div className="p-3 rounded-lg bg-blue-200 text-blue-700 group-hover:bg-blue-300 transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <div className="font-semibold text-gray-900">{t('dashboard.analytics')}</div>
              <div className="text-sm text-gray-500">{t('dashboard.viewInsights')}</div>
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
            className={`flex items-center p-4 rounded-xl transition-colors group ${
              stats.totalCourses >= limits.courses
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <div className={`p-3 rounded-lg transition-colors ${
              stats.totalCourses >= limits.courses
                ? 'bg-gray-300 text-gray-500'
                : 'bg-amber-200 text-amber-700 group-hover:bg-amber-300'
            }`}>
              <Plus className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <div className={`font-semibold ${
                stats.totalCourses >= limits.courses ? 'text-gray-400' : 'text-gray-900'
              }`}>{t('dashboard.createCourse')}</div>
              <div className="text-sm text-gray-500">{t('dashboard.addNewContent')}</div>
            </div>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
