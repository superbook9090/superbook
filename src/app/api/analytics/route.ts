// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { User, Course, Quiz, Enrollment, QuizAttempt, Blog } from '@/models';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/analytics',
  };

  try {
    const featureCheck = await requireFeature('enableAnalytics');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const isAdmin = session.user?.role === 'admin';
    const isSuperAdmin = session.user?.role === 'superadmin';
    const isTeacher = session.user?.role === 'teacher';

    // Admin gets organization-specific analytics, superadmin gets system-wide
    if (type === 'admin' && (isAdmin || isSuperAdmin)) {
      const stats = await getAdminStats(session.user.organizationId, isSuperAdmin, startDate, endDate);
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

async function getAdminStats(organizationId?: string | null, isSuperAdmin: boolean = false, startDateStr?: string | null, endDateStr?: string | null) {
  // Build organization filter
  const orgObjectId = organizationId && mongoose.Types.ObjectId.isValid(organizationId)
    ? new mongoose.Types.ObjectId(organizationId)
    : null;
  const orgFilter = isSuperAdmin ? {} : (orgObjectId ? { organizationId: orgObjectId } : { organizationId: null });

  const nowTime = Date.now();
  
  let rangeStart = new Date();
  rangeStart.setDate(1);
  rangeStart.setHours(0, 0, 0, 0);

  let rangeEnd = new Date();
  
  let trendStart = new Date();
  trendStart.setDate(trendStart.getDate() - 13);
  trendStart.setHours(0, 0, 0, 0);

  const customStartDate = startDateStr ? new Date(startDateStr) : null;
  const customEndDate = endDateStr ? new Date(endDateStr) : null;

  if (customStartDate && !isNaN(customStartDate.getTime())) {
    customStartDate.setHours(0, 0, 0, 0);
    rangeStart = customStartDate;
    trendStart = customStartDate;
  }
  
  if (customEndDate && !isNaN(customEndDate.getTime())) {
    customEndDate.setHours(23, 59, 59, 999);
    rangeEnd = customEndDate;
  }

  const oneDayAgo = new Date(nowTime - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(nowTime - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(nowTime - 30 * 24 * 60 * 60 * 1000);
  
  const createdRangeQuery = { $gte: rangeStart, $lte: rangeEnd };
  const trendDaysCount = Math.max(1, Math.ceil((rangeEnd.getTime() - trendStart.getTime()) / (1000 * 60 * 60 * 24)));
  const trendDaysMax = Math.min(trendDaysCount, 90); // Cap at 90 days to avoid huge arrays
  
  // Use rangeEnd for orgFilter if filtering by creation date
  // For total counts we might want all time, but the user asked for date-wise analytics
  // Usually this means we filter the "new in range" stats. We'll leave total counts as all time
  // unless we explicitly want to filter everything. Let's just adjust the range queries.

  const [
    totalUsers,
    students,
    teachers,
    admins,
    newUsersThisMonth,
    dauCount,
    wauCount,
    mauCount,
    appUsersCount,
    webUsersCount,
    androidUsersCount,
    iosUsersCount,
    activeAppUsersCount,
    activeWebUsersCount,
    totalCourses,
    publishedCourses,
    totalQuizzes,
    publishedQuizzes,
    totalBlogs,
    publishedBlogs,
    orgUserIds,
    orgQuizIds,
    userDailyTrends,
    topEnrolledCourses,
  ] = await Promise.all([
    User.countDocuments(orgFilter),
    User.countDocuments({ ...orgFilter, role: 'student' }),
    User.countDocuments({ ...orgFilter, role: 'teacher' }),
    User.countDocuments({ ...orgFilter, role: 'admin' }),
    User.countDocuments({
      ...orgFilter,
      createdAt: createdRangeQuery,
    }),
    User.countDocuments({ ...orgFilter, lastActiveAt: { $gte: oneDayAgo } }),
    User.countDocuments({ ...orgFilter, lastActiveAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ ...orgFilter, lastActiveAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ ...orgFilter, lastPlatform: { $in: ['android', 'ios'] } }),
    User.countDocuments({
      ...orgFilter,
      $or: [{ lastPlatform: 'web' }, { lastPlatform: { $exists: false } }, { lastPlatform: null }],
    }),
    User.countDocuments({ ...orgFilter, lastPlatform: 'android' }),
    User.countDocuments({ ...orgFilter, lastPlatform: 'ios' }),
    User.countDocuments({
      ...orgFilter,
      lastPlatform: { $in: ['android', 'ios'] },
      lastActiveAt: { $gte: thirtyDaysAgo },
    }),
    User.countDocuments({
      ...orgFilter,
      $or: [{ lastPlatform: 'web' }, { lastPlatform: { $exists: false } }, { lastPlatform: null }],
      lastActiveAt: { $gte: thirtyDaysAgo },
    }),
    Course.countDocuments(orgFilter),
    Course.countDocuments({ ...orgFilter, isPublished: true }),
    Quiz.countDocuments(orgFilter),
    Quiz.countDocuments({ ...orgFilter, isPublished: true }),
    Blog.countDocuments(orgFilter),
    Blog.countDocuments({ ...orgFilter, isPublished: true }),
    User.find(orgFilter).select('_id').lean(),
    Quiz.find(orgFilter).select('_id').lean(),
    User.aggregate([
      { $match: { ...orgFilter, createdAt: { $gte: trendStart, $lte: rangeEnd } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    Course.aggregate([
      { $match: orgFilter },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments',
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          isPublished: 1,
          category: 1,
          studentsCount: { $size: '$enrollments' },
        },
      },
      { $sort: { studentsCount: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const userIds = orgUserIds.map((u) => u._id);
  const quizIds = orgQuizIds.map((q) => q._id);

  const [
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    totalAttempts,
    scoreStats,
    enrollmentDailyTrends,
    quizAttemptDailyTrends,
    recentEnrollments,
    recentQuizAttempts,
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
    Enrollment.aggregate([
      { $match: { student: { $in: userIds }, createdAt: { $gte: trendStart, $lte: rangeEnd } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    quizIds.length
      ? QuizAttempt.aggregate([
          { $match: { quiz: { $in: quizIds }, status: 'completed', createdAt: { $gte: trendStart, $lte: rangeEnd } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
        ])
      : Promise.resolve([]),
    Enrollment.find({ student: { $in: userIds } })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('student', 'name email')
      .populate('course', 'title')
      .lean(),
    quizIds.length
      ? QuizAttempt.find({ quiz: { $in: quizIds }, status: 'completed' })
          .sort({ createdAt: -1 })
          .limit(6)
          .populate('student', 'name email')
          .populate('quiz', 'title')
          .lean()
      : Promise.resolve([]),
  ]);

  // Build 14-day trend timeline
  const trendDays: { date: string; signups: number; enrollments: number; attempts: number }[] = [];
  const userTrendMap = new Map((userDailyTrends || []).map((u: { _id: string; count: number }) => [u._id, u.count]));
  const enrollmentTrendMap = new Map((enrollmentDailyTrends || []).map((e: { _id: string; count: number }) => [e._id, e.count]));
  const attemptTrendMap = new Map((quizAttemptDailyTrends || []).map((a: { _id: string; count: number }) => [a._id, a.count]));

  for (let i = 0; i < trendDaysMax; i++) {
    const d = new Date(trendStart);
    d.setDate(d.getDate() + i);
    if (d.getTime() > rangeEnd.getTime()) break;
    const dateStr = d.toISOString().split('T')[0];
    trendDays.push({
      date: dateStr,
      signups: userTrendMap.get(dateStr) || 0,
      enrollments: enrollmentTrendMap.get(dateStr) || 0,
      attempts: attemptTrendMap.get(dateStr) || 0,
    });
  }

  // Combine and sort recent activity
  const recentActivity = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...recentEnrollments.map((e: any) => ({
      type: 'enrollment' as const,
      user: e.student?.name || e.student?.email || 'Student',
      item: e.course?.title || 'Course',
      date: e.createdAt,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...recentQuizAttempts.map((q: any) => ({
      type: 'quiz_attempt' as const,
      user: q.student?.name || q.student?.email || 'Student',
      item: q.quiz?.title || 'Quiz',
      score: q.score,
      date: q.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const inactiveCount = Math.max(0, totalUsers - mauCount);
  const stickinessRatio = mauCount > 0 ? Math.round((dauCount / mauCount) * 100) : 0;
  const appPct = totalUsers > 0 ? Math.round((appUsersCount / totalUsers) * 100) : 0;
  const webPct = totalUsers > 0 ? Math.max(0, 100 - appPct) : 0;

  return {
    users: {
      total: totalUsers,
      students,
      teachers,
      admins,
      newThisMonth: newUsersThisMonth,
    },
    activeUsers: {
      dau: dauCount,
      wau: wauCount,
      mau: mauCount,
      inactive: inactiveCount,
      stickinessRatio,
      recency: {
        within24Hours: dauCount,
        within7Days: Math.max(0, wauCount - dauCount),
        within30Days: Math.max(0, mauCount - wauCount),
        olderOrNever: inactiveCount,
      },
    },
    platformStats: {
      totalApp: appUsersCount,
      totalWeb: webUsersCount,
      android: androidUsersCount,
      ios: iosUsersCount,
      activeApp: activeAppUsersCount,
      activeWeb: activeWebUsersCount,
      appPercentage: appPct,
      webPercentage: webPct,
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
    blogs: {
      total: totalBlogs,
      published: publishedBlogs,
    },
    trends: trendDays,
    topCourses: topEnrolledCourses.map((c: { _id: unknown; title: string; isPublished: boolean; category?: string; studentsCount: number }) => ({
      _id: String(c._id),
      title: c.title,
      isPublished: c.isPublished,
      category: c.category || 'General',
      studentsCount: c.studentsCount || 0,
    })),
    recentActivity,
  };
}

async function getTeacherStats(teacherId: string) {
  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return {
      courses: [],
      overview: { totalCourses: 0, totalStudents: 0, totalQuizzes: 0, totalAttempts: 0, averageScore: 0, publishedCourses: 0 },
      topStudents: [],
    };
  }

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
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { enrollments: 0, completedCourses: 0, quizzesTaken: 0, averageScore: 0 };
    }
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
