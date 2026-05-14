// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { User, Course, Quiz, Enrollment, QuizAttempt } from '@/models';
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
    const isSuperAdmin = session.user?.role === 'superadmin';
    const isTeacher = session.user?.role === 'teacher';

    // Admin gets organization-specific analytics, superadmin gets system-wide
    if (type === 'admin' && (isAdmin || isSuperAdmin)) {
      const stats = await getAdminStats(session.user.organizationId, isSuperAdmin);
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

async function getAdminStats(organizationId?: string | null, isSuperAdmin: boolean = false) {
  // Build organization filter
  const orgFilter = isSuperAdmin ? {} : (organizationId ? { organizationId } : { organizationId: null });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    students,
    teachers,
    admins,
    newUsersThisMonth,
    totalCourses,
    publishedCourses,
    totalQuizzes,
    publishedQuizzes,
  ] = await Promise.all([
    User.countDocuments(orgFilter),
    User.countDocuments({ ...orgFilter, role: 'student' }),
    User.countDocuments({ ...orgFilter, role: 'teacher' }),
    User.countDocuments({ ...orgFilter, role: 'admin' }),
    User.countDocuments({
      ...orgFilter,
      createdAt: { $gte: startOfMonth },
    }),
    Course.countDocuments(orgFilter),
    Course.countDocuments({ ...orgFilter, isPublished: true }),
    Quiz.countDocuments(orgFilter),
    Quiz.countDocuments({ ...orgFilter, isPublished: true }),
  ]);

  const [orgUserIds, orgQuizIds] = await Promise.all([
    User.find(orgFilter).select('_id').lean(),
    Quiz.find(orgFilter).select('_id').lean(),
  ]);
  const userIds = orgUserIds.map((u) => u._id);
  const quizIds = orgQuizIds.map((q) => q._id);

  const [
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    totalAttempts,
    scoreStats,
    recentEnrollments,
  ] = await Promise.all([
    Enrollment.countDocuments({ student: { $in: userIds } }),
    Enrollment.countDocuments({ student: { $in: userIds }, status: 'active' }),
    Enrollment.countDocuments({ student: { $in: userIds }, status: 'completed' }),
    quizIds.length
      ? QuizAttempt.countDocuments({ quiz: { $in: quizIds }, status: 'completed' })
      : Promise.resolve(0),
    quizIds.length
      ? QuizAttempt.aggregate([
          { $match: { quiz: { $in: quizIds }, status: 'completed' } },
          {
            $group: {
              _id: null,
              avgScore: { $avg: '$score' },
              highestScore: { $max: '$score' },
            },
          },
        ])
      : Promise.resolve([]),
    Enrollment.find({ student: { $in: userIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('student', 'name')
      .populate('course', 'title')
      .lean(),
  ]);

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
        // Same-stage $field refs for $cond are unreliable across MongoDB versions; size the array directly.
        avgScore: {
          $cond: {
            if: { $gt: [{ $size: '$completedAttempts' }, 0] },
            then: {
              $avg: {
                $map: { input: '$completedAttempts', as: 'a', in: '$$a.score' },
              },
            },
            else: null,
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        isPublished: 1,
        students: '$enrollmentCount',
        quizIds: '$quizzes._id',
        quizzes: '$quizCount',
        attempts: '$attemptCount',
        averageScore: { $round: [{ $ifNull: ['$avgScore', 0] }, 0] },
      },
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quizIdsForTop = courseStats.flatMap((c: any) => c.quizIds || []);
  // Strip internal quizIds from API payload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courses = courseStats.map((course: any) => {
    const sanitizedCourse = { ...course };
    delete sanitizedCourse.quizIds;
    return sanitizedCourse;
  });

  // Calculate overview stats from aggregated data
  const totalCourses = courses.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publishedCourses = courses.filter((c: any) => c.isPublished).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalStudents = courses.reduce((sum: number, c: any) => sum + c.students, 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalQuizzes = courses.reduce((sum: number, c: any) => sum + c.quizzes, 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalAttempts = courses.reduce((sum: number, c: any) => sum + c.attempts, 0);
  const averageScore = totalAttempts > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? Math.round(courses.reduce((sum: number, c: any) => sum + c.averageScore * c.attempts, 0) / totalAttempts)
    : 0;

  // Get top performing students using aggregation
  const topStudents =
    quizIdsForTop.length === 0
      ? []
      : await QuizAttempt.aggregate([
    {
      $match: {
        quiz: { $in: quizIdsForTop },
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
    courses,
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
    const oid = new mongoose.Types.ObjectId(userId);
    const [enrollmentAgg, attemptAgg] = await Promise.all([
      Enrollment.aggregate([
        { $match: { student: oid } },
        {
          $facet: {
            total: [{ $count: 'n' }],
            completed: [{ $match: { status: 'completed' } }, { $count: 'n' }],
          },
        },
      ]),
      QuizAttempt.aggregate([
        { $match: { student: oid, status: 'completed' } },
        {
          $group: {
            _id: null,
            n: { $sum: 1 },
            avg: { $avg: '$score' },
          },
        },
      ]),
    ]);

    const enrollments = enrollmentAgg[0]?.total[0]?.n ?? 0;
    const completedCourses = enrollmentAgg[0]?.completed[0]?.n ?? 0;
    const quizzesTaken = attemptAgg[0]?.n ?? 0;
    const averageScore =
      quizzesTaken > 0 ? Math.round((attemptAgg[0]?.avg as number) || 0) : 0;

    return {
      enrollments,
      completedCourses,
      quizzesTaken,
      averageScore,
    };
  }

  return {};
}
