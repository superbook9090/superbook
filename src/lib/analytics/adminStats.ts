import mongoose from 'mongoose';
import { User, Course, Quiz, Enrollment, QuizAttempt, Blog } from '@/models';
import { parseDateRange } from '@/lib/dateUtils';
import { buildAdminTrendTimeline, formatRecentActivity } from './adminTrends';

export async function getAdminStats(
  organizationId?: string | null,
  isSuperAdmin: boolean = false,
  startDateStr?: string | null,
  endDateStr?: string | null
) {
  const orgObjectId =
    organizationId && mongoose.Types.ObjectId.isValid(organizationId)
      ? new mongoose.Types.ObjectId(organizationId)
      : null;
  const orgFilter = isSuperAdmin
    ? {}
    : orgObjectId
      ? { organizationId: orgObjectId }
      : { organizationId: null };

  const nowTime = Date.now();
  const { rangeStart, rangeEnd, trendStart } = parseDateRange(startDateStr, endDateStr, 13);

  const oneDayAgo = new Date(nowTime - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(nowTime - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(nowTime - 30 * 24 * 60 * 60 * 1000);

  const createdRangeQuery = { $gte: rangeStart, $lte: rangeEnd };

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
    User.countDocuments({ ...orgFilter, createdAt: createdRangeQuery }),
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

  const trends = buildAdminTrendTimeline(
    trendStart,
    rangeEnd,
    userDailyTrends,
    enrollmentDailyTrends,
    quizAttemptDailyTrends
  );

  const recentActivity = formatRecentActivity(
    recentEnrollments as unknown as Parameters<typeof formatRecentActivity>[0],
    recentQuizAttempts as unknown as Parameters<typeof formatRecentActivity>[1]
  );

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
    trends,
    topCourses: (topEnrolledCourses as { _id: unknown; title: string; isPublished: boolean; category?: string; studentsCount: number }[]).map((c) => ({
      _id: String(c._id),
      title: c.title,
      isPublished: c.isPublished,
      category: c.category || 'General',
      studentsCount: c.studentsCount || 0,
    })),
    recentActivity,
  };
}
