// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import '@/models/Lesson'; // Import to register Lesson model
import User from '@/models/User';
import Course from '@/models/Course';
import Quiz from '@/models/Quiz';
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';
import { logApiError, type LogContext } from '@/lib/logger';

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/analytics',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview'; // overview, teacher, admin

    const isAdmin = session.user?.role === 'admin';
    const isTeacher = session.user?.role === 'teacher';

    // Admin gets system-wide analytics
    if (type === 'admin' && isAdmin) {
      const stats = await getAdminStats();
      return NextResponse.json({ stats }, { status: 200 });
    }

    // Teacher gets their course analytics
    if (type === 'teacher' && (isTeacher || isAdmin)) {
      const stats = await getTeacherStats(session.user.id);
      return NextResponse.json({ stats }, { status: 200 });
    }

    // Overview for current user
    const stats = await getUserOverview(session.user.id, session.user.role);
    return NextResponse.json({ stats }, {
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/analytics', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

async function getAdminStats() {
  // User stats
  const totalUsers = await User.countDocuments();
  const students = await User.countDocuments({ role: 'student' });
  const teachers = await User.countDocuments({ role: 'teacher' });
  const admins = await User.countDocuments({ role: 'admin' });

  // New users this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth },
  });

  // Course stats
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });

  // Enrollment stats
  const totalEnrollments = await Enrollment.countDocuments();
  const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
  const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });

  // Quiz stats
  const totalQuizzes = await Quiz.countDocuments();
  const publishedQuizzes = await Quiz.countDocuments({ isPublished: true });

  // Quiz attempt stats
  const totalAttempts = await QuizAttempt.countDocuments({ status: 'completed' });

  // Average scores
  const scoreStats = await QuizAttempt.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        avgScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
      },
    },
  ]);

  // Recent activity
  const recentEnrollments = await Enrollment.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('student', 'name')
    .populate('course', 'title')
    .lean();

  return {
    users: {
      total: totalUsers,
      students,
      teachers,
      admins,
      newThisMonth: newUsersThisMonth,
    },
    courses: {
      total: totalCourses,
      published: publishedCourses,
    },
    enrollments: {
      total: totalEnrollments,
      active: activeEnrollments,
      completed: completedEnrollments,
    },
    quizzes: {
      total: totalQuizzes,
      published: publishedQuizzes,
      totalAttempts,
      averageScore: scoreStats.length > 0 ? Math.round(scoreStats[0].avgScore) : 0,
      highestScore: scoreStats.length > 0 ? scoreStats[0].highestScore : 0,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentActivity: recentEnrollments.map((e: any) => ({
      type: 'enrollment',
      user: e.student?.name,
      course: e.course?.title,
      date: e.createdAt,
    })),
  };
}

async function getTeacherStats(teacherId: string) {
  // Use aggregation to get all data in a single query pipeline
  const courseStats = await Course.aggregate([
    { $match: { instructor: new mongoose.Types.ObjectId(teacherId) } },
    {
      $lookup: {
        from: 'enrollments',
        localField: '_id',
        foreignField: 'course',
        as: 'enrollments'
      }
    },
    {
      $lookup: {
        from: 'quizzes',
        localField: '_id',
        foreignField: 'course',
        as: 'quizzes'
      }
    },
    {
      $lookup: {
        from: 'quizattempts',
        localField: 'quizzes._id',
        foreignField: 'quiz',
        as: 'attempts'
      }
    },
    {
      $addFields: {
        enrollmentCount: { $size: '$enrollments' },
        quizCount: { $size: '$quizzes' },
        completedAttempts: {
          $filter: {
            input: '$attempts',
            as: 'attempt',
            cond: { $eq: ['$$attempt.status', 'completed'] }
          }
        }
      }
    },
    {
      $addFields: {
        attemptCount: { $size: '$completedAttempts' },
        avgScore: {
          $cond: {
            if: { $gt: ['$attemptCount', 0] },
            then: { $avg: '$completedAttempts.score' },
            else: 0
          }
        }
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        isPublished: 1,
        students: '$enrollmentCount',
        quizzes: '$quizCount',
        attempts: '$attemptCount',
        averageScore: { $round: ['$avgScore', 0] }
      }
    }
  ]);

  // Calculate overview stats from aggregated data
  const totalCourses = courseStats.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publishedCourses = courseStats.filter((c: any) => c.isPublished).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalStudents = courseStats.reduce((sum: number, c: any) => sum + c.students, 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalQuizzes = courseStats.reduce((sum: number, c: any) => sum + c.quizzes, 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalAttempts = courseStats.reduce((sum: number, c: any) => sum + c.attempts, 0);
  const averageScore = totalAttempts > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? Math.round(courseStats.reduce((sum: number, c: any) => sum + c.averageScore * c.attempts, 0) / totalAttempts)
    : 0;

  // Get top performing students using aggregation
  const topStudents = await QuizAttempt.aggregate([
    {
      $match: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quiz: { $in: courseStats.flatMap((c: any) => c.quizzes) },
        status: 'completed'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'student',
        foreignField: '_id',
        as: 'studentData'
      }
    },
    {
      $unwind: '$studentData'
    },
    {
      $group: {
        _id: '$student',
        name: { $first: '$studentData.name' },
        totalScore: { $sum: '$score' },
        attempts: { $sum: 1 }
      }
    },
    {
      $addFields: {
        averageScore: { $round: [{ $divide: ['$totalScore', '$attempts'] }, 0] }
      }
    },
    { $sort: { averageScore: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        name: 1,
        totalScore: 1,
        attempts: 1,
        averageScore: 1
      }
    }
  ]);

  return {
    courses: courseStats,
    overview: {
      totalCourses,
      totalStudents,
      totalQuizzes,
      totalAttempts,
      averageScore,
      publishedCourses,
    },
    topStudents,
  };
}

async function getUserOverview(userId: string, role: string) {
  if (role === 'student') {
    const enrollments = await Enrollment.countDocuments({ student: userId });
    const completedCourses = await Enrollment.countDocuments({
      student: userId,
      status: 'completed',
    });
    const attempts = await QuizAttempt.find({ student: userId, status: 'completed' }).lean();

    return {
      enrollments,
      completedCourses,
      quizzesTaken: attempts.length,
      averageScore:
        attempts.length > 0
          ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
          : 0,
    };
  }

  return {};
}
