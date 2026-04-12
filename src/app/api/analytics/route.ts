// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models/Lesson'; // Import to register Lesson model
import User from '@/models/User';
import Course from '@/models/Course';
import Quiz from '@/models/Quiz';
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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
    return NextResponse.json({ stats }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching analytics' },
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
    recentActivity: recentEnrollments.map((e: any) => ({
      type: 'enrollment',
      user: e.student?.name,
      course: e.course?.title,
      date: e.createdAt,
    })),
  };
}

async function getTeacherStats(teacherId: string) {
  // Teacher's courses
  const courses = await Course.find({ instructor: teacherId }).lean();
  const courseIds = courses.map((c) => c._id.toString());

  // Enrollments in teacher's courses
  const enrollments = await Enrollment.find({
    course: { $in: courseIds },
  }).lean();

  // Quizzes in teacher's courses
  const quizzes = await Quiz.find({ course: { $in: courseIds } }).lean();
  const quizIds = quizzes.map((q) => q._id.toString());

  // Attempts on teacher's quizzes
  const attempts = await QuizAttempt.find({
    quiz: { $in: quizIds },
    status: 'completed',
  }).lean();

  // Calculate stats per course
  const courseStats = courses.map((course) => {
    const courseEnrollments = enrollments.filter(
      (e) => e.course.toString() === course._id.toString()
    );
    const courseQuizzes = quizzes.filter(
      (q) => q.course.toString() === course._id.toString()
    );
    const courseQuizIds = courseQuizzes.map((q) => q._id.toString());
    const courseAttempts = attempts.filter((a) =>
      courseQuizIds.includes(a.quiz.toString())
    );

    const avgScore =
      courseAttempts.length > 0
        ? Math.round(
            courseAttempts.reduce((sum, a) => sum + a.score, 0) /
              courseAttempts.length
          )
        : 0;

    return {
      _id: course._id,
      title: course.title,
      students: courseEnrollments.length,
      quizzes: courseQuizzes.length,
      attempts: courseAttempts.length,
      averageScore: avgScore,
      isPublished: course.isPublished,
    };
  });

  // Overall teacher stats
  const totalStudents = new Set(enrollments.map((e) => e.student.toString())).size;
  const totalAttempts = attempts.length;
  const averageScore =
    totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
      : 0;

  // Top performing students
  const studentScores: { [key: string]: { name: string; totalScore: number; attempts: number } } = {};

  // Need to populate student data
  const attemptsWithStudents = await QuizAttempt.find({
    quiz: { $in: quizIds },
    status: 'completed',
  })
    .populate('student', 'name')
    .lean();

  attemptsWithStudents.forEach((attempt: any) => {
    const studentId = attempt.student?._id?.toString();
    if (!studentId) return;

    if (!studentScores[studentId]) {
      studentScores[studentId] = {
        name: attempt.student.name,
        totalScore: 0,
        attempts: 0,
      };
    }
    studentScores[studentId].totalScore += attempt.score;
    studentScores[studentId].attempts += 1;
  });

  const topStudents = Object.values(studentScores)
    .map((s) => ({
      ...s,
      averageScore: Math.round(s.totalScore / s.attempts),
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);

  return {
    courses: courseStats,
    overview: {
      totalCourses: courses.length,
      totalStudents,
      totalQuizzes: quizzes.length,
      totalAttempts,
      averageScore,
      publishedCourses: courses.filter((c) => c.isPublished).length,
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
