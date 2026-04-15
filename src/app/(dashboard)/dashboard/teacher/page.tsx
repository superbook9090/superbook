// src/app/(dashboard)/dashboard/teacher/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  HelpCircle,
  CheckCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  BarChart3
} from 'lucide-react';

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
  publishedCourses: number;
}

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    publishedCourses: 0,
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const [coursesRes, quizzesRes] = await Promise.all([
        fetch('/api/courses?instructor=self'),
        fetch('/api/quizzes'),
      ]);

      const coursesData = await coursesRes.json();
      const quizzesData = await quizzesRes.json();

      if (coursesRes.ok && quizzesRes.ok) {
        const courses: Course[] = coursesData.courses || [];
        const allQuizzes: Quiz[] = quizzesData.quizzes || [];

        // Filter quizzes for this teacher's courses
        const courseIds = new Set(courses.map((c) => c._id.toString()));
        const teacherQuizzes = allQuizzes.filter((q) => {
          const quizCourseId = typeof q.course === 'object' && q.course !== null
            ? q.course._id?.toString()
            : q.course?.toString();
          return quizCourseId && courseIds.has(quizCourseId);
        });

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
          publishedCourses: publishedCount,
        });

        // Get 3 most recent courses
        setRecentCourses(courses.slice(0, 3));
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
          <p className="text-gray-500">Loading dashboard...</p>
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
              Teacher Dashboard
            </h1>
            <p className="text-emerald-100 text-lg">
              Welcome back, {session?.user?.name}! Manage your content.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="/dashboard/teacher/courses/create"
              className="inline-flex items-center px-4 py-2.5 bg-white text-emerald-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Modern Design */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* My Courses */}
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
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCourses}</div>
            <div className="text-sm text-gray-500">My Courses</div>
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
            <div className="text-sm text-gray-500">Students</div>
          </div>
        </motion.div>

        {/* Quizzes */}
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
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalQuizzes}</div>
            <div className="text-sm text-gray-500">Quizzes</div>
          </div>
        </motion.div>

        {/* Published */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600 w-fit mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.publishedCourses}</div>
            <div className="text-sm text-gray-500">Published</div>
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
            <h2 className="text-xl font-semibold text-gray-900">Recent Courses</h2>
            <a 
              href="/dashboard/teacher/courses" 
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
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
                      Published
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{course.title}</h3>
                <p className="text-sm text-gray-500">
                  {course.enrolledStudents?.length || 0} students enrolled
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
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
              <div className="font-semibold text-gray-900">Manage Courses</div>
              <div className="text-sm text-gray-500">View and edit</div>
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
              <div className="font-semibold text-gray-900">Manage Quizzes</div>
              <div className="text-sm text-gray-500">Create & review</div>
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
              <div className="font-semibold text-gray-900">Analytics</div>
              <div className="text-sm text-gray-500">View insights</div>
            </div>
          </motion.a>
          
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/dashboard/teacher/courses/create"
            className="flex items-center p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group"
          >
            <div className="p-3 rounded-lg bg-amber-200 text-amber-700 group-hover:bg-amber-300 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <div className="font-semibold text-gray-900">Create Course</div>
              <div className="text-sm text-gray-500">Add new content</div>
            </div>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
