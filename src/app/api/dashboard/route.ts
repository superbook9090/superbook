// src/app/api/dashboard/route.ts
// Consolidated dashboard API - Single source of truth for dashboard data
// Returns role-based data: student or teacher

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course, Enrollment, Blog } from '@/models';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import AppSettings from '@/models/AppSettings';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { getCachedData, setCachedData } from '@/lib/redis';

export const dynamic = 'force-dynamic';

// Dashboard response types
export interface StudentDashboardData {
  role: 'student';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enrollments: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quizAttempts: any[];
  stats: {
    enrolledCount: number;
    completedQuizzes: number;
    averageScore: number;
  };
}

export interface TeacherDashboardData {
  role: 'teacher' | 'admin';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  courses: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quizzes: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blogs: any[];
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalQuizzes: number;
    totalBlogs: number;
    publishedCourses: number;
  };
  limits: {
    courses: number;
    quizzes: number;
    blogs: number;
    userLimits?: {
      courses?: number;
      quizzes?: number;
      blogs?: number;
    };
  };
}

export type DashboardData = StudentDashboardData | TeacherDashboardData;

// GET /api/dashboard - Get consolidated dashboard data based on user role
export async function GET() {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/dashboard',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    const role = session.user?.role || 'student';
    const isStaff = ['teacher', 'admin', 'superadmin'].includes(role);
    const userId = session.user?.id;

    // Build cache key based on user
    const cacheKey = `dashboard:${userId}:${role}`;

    // Try cache first (short cache for dashboard data)
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    await dbConnect();

    let dashboardData: DashboardData;

    if (isStaff) {
      // Teacher/Admin Dashboard Data
      dashboardData = await getTeacherDashboardData(
        userId,
        role as 'teacher' | 'admin',
        session.user?.organizationId
      );
    } else {
      // Student Dashboard Data
      dashboardData = await getStudentDashboardData(userId);
    }

    // Cache for 30 seconds (dashboard data changes frequently but not instantly)
    await setCachedData(cacheKey, dashboardData, 30);

    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/dashboard', logContext);
    return NextResponse.json(
      { message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// Helper function to get student dashboard data
async function getStudentDashboardData(userId: string): Promise<StudentDashboardData> {
  // Fetch enrollments with course data
  const enrollments = await Enrollment.find({ student: userId })
    .populate('course', 'title description thumbnail category instructor price')
    .populate('student', 'name email')
    .populate('completedLessons', 'title')
    .sort({ enrolledAt: -1 })
    .lean();

  // Sanitize enrollments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitizedEnrollments: any[] = enrollments.map((enrollment) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitized: any = { ...enrollment };
    if (sanitized.enrolledAt) {
      sanitized.enrolledAt = new Date(sanitized.enrolledAt).toISOString();
    }
    if (sanitized.completedAt) {
      sanitized.completedAt = new Date(sanitized.completedAt).toISOString();
    }
    return sanitized;
  });

  // Fetch quiz attempts
  const quizAttempts = await QuizAttempt.find({ student: userId })
    .populate('quiz', 'title description timeLimit')
    .populate('course', 'title description')
    .populate('student', 'name email')
    .sort({ startedAt: -1 })
    .lean();

  // Sanitize attempts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitizedAttempts: any[] = quizAttempts.map((attempt) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitized: any = { ...attempt };
    if (sanitized.startedAt) {
      sanitized.startedAt = new Date(sanitized.startedAt).toISOString();
    }
    if (sanitized.submittedAt) {
      sanitized.submittedAt = new Date(sanitized.submittedAt).toISOString();
    }
    // Remove correct answers from quiz questions for security
    if (sanitized.quiz && typeof sanitized.quiz === 'object' && 'questions' in sanitized.quiz) {
      sanitized.quiz = sanitized.quiz.questions?.map((q: { _id?: { toString(): string }; question?: string; options?: string[] }) => ({
        _id: q._id?.toString(),
        question: q.question,
        options: q.options,
      }));
    }
    return sanitized;
  });

  // Calculate stats
  const completedAttempts = sanitizedAttempts.filter((a) => a.status === 'completed');
  const avgScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((sum, a) => sum + ((a as { score?: number }).score || 0), 0) / completedAttempts.length)
    : 0;

  // Serialize to convert ObjectIds to strings
  return {
    role: 'student',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    enrollments: serialize(sanitizedEnrollments) as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quizAttempts: serialize(sanitizedAttempts) as any[],
    stats: {
      enrolledCount: sanitizedEnrollments.length,
      completedQuizzes: completedAttempts.length,
      averageScore: avgScore,
    },
  };
}

// Helper function to get teacher dashboard data
async function getTeacherDashboardData(
  userId: string,
  role: 'teacher' | 'admin',
  organizationId?: string | null
): Promise<TeacherDashboardData> {
  // Build query for teacher's courses
  const courseQuery: Record<string, unknown> = { instructor: userId };
  if (organizationId) {
    courseQuery.organizationId = organizationId;
  }

  // Fetch courses
  const courses = await Course.find(courseQuery, {
    title: 1,
    description: 1,
    price: 1,
    category: 1,
    thumbnail: 1,
    isPublished: 1,
    language: 1,
    createdAt: 1,
    enrolledCount: 1,
  })
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  // Fetch quizzes for this teacher's courses
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseIds: string[] = courses.map((c: any) => c._id?.toString()).filter(Boolean);
  const quizzes = await Quiz.find(
    { course: { $in: courseIds } },
    {
      title: 1,
      description: 1,
      timeLimit: 1,
      isPublished: 1,
      course: 1,
      createdAt: 1,
    }
  )
    .populate('course', 'title description')
    .sort({ createdAt: -1 })
    .lean();

  // Fetch blogs for this teacher
  const blogQuery: Record<string, unknown> = { author: userId };
  if (organizationId) {
    blogQuery.organizationId = organizationId;
  }
  const blogs = await Blog.find(blogQuery)
    .populate('author', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  // Fetch settings for limits
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings: any = await AppSettings.findOne().lean();
  const teacherLimits = settings?.teacherLimits || { courses: 5, quizzes: 10, blogs: 10 };

  // Calculate stats
  const totalStudents = courses.reduce((sum, course) => {
    return sum + (course.enrolledCount || 0);
  }, 0);

  const publishedCount = courses.filter((c) => c.isPublished).length;

  return {
    role,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    courses: serialize(courses) as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quizzes: serialize(quizzes) as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blogs: serialize(blogs) as any[],
    stats: {
      totalCourses: courses.length,
      totalStudents,
      totalQuizzes: quizzes.length,
      totalBlogs: blogs.length,
      publishedCourses: publishedCount,
    },
    limits: {
      ...teacherLimits,
      userLimits: {
        courses: undefined,
        quizzes: undefined,
        blogs: undefined,
      },
    },
  };
}
