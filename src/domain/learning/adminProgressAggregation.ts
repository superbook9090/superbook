import { type Types } from 'mongoose';
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';
import Course from '@/models/Course';
import User from '@/models/User';

export async function aggregateAdminProgress(opts: {
  organizationId?: string | null;
  isSuperAdmin?: boolean;
  search?: string | null;
  skip?: number;
  limit?: number;
}) {
  const orgFilter = opts.isSuperAdmin
    ? {}
    : opts.organizationId
    ? { organizationId: opts.organizationId }
    : { organizationId: null };

  const [
    totalUsers,
    totalCourses,
    allCourses,
    enrollmentsAgg,
    attemptStats,
  ] = await Promise.all([
    User.countDocuments({ ...orgFilter, role: 'student' }),
    Course.countDocuments(orgFilter),
    Course.find(orgFilter).select('_id title thumbnail category isPublished').lean(),
    Enrollment.aggregate<{
      _id: null;
      total: number;
      active: number;
      completed: number;
      avgProgress: number;
    }>([
      {
        $facet: {
          metrics: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                avgProgress: { $avg: '$progress' },
              },
            },
          ],
        },
      },
      { $unwind: { path: '$metrics', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, total: '$metrics.total', active: '$metrics.active', completed: '$metrics.completed', avgProgress: '$metrics.avgProgress' } },
    ]),
    QuizAttempt.aggregate<{
      _id: null;
      totalAttempts: number;
      avgScore: number;
      passedAttempts: number;
    }>([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$score' },
          passedAttempts: { $sum: { $cond: [{ $gte: ['$score', 60] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const courseIds = allCourses.map((c) => c._id);

  const courseHealthAgg = await Enrollment.aggregate<{
    _id: Types.ObjectId;
    total: number;
    completed: number;
    avgProgress: number;
  }>([
    { $match: { course: { $in: courseIds } } },
    {
      $group: {
        _id: '$course',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        avgProgress: { $avg: '$progress' },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 10 },
  ]);

  const courseMap = new Map(allCourses.map((c) => [c._id.toString(), c]));
  const courseHealth = courseHealthAgg.map((h) => {
    const c = courseMap.get(h._id.toString());
    const completionRate = h.total > 0 ? Math.round((h.completed / h.total) * 100) : 0;
    return {
      _id: h._id.toString(),
      title: c?.title || 'Unknown Course',
      category: c?.category || 'General',
      totalEnrolled: h.total,
      completedCount: h.completed,
      completionRate,
      averageProgress: Math.round(h.avgProgress || 0),
    };
  });

  const enrollmentsQuery = Enrollment.find({})
    .populate('student', 'name email avatar')
    .populate('course', 'title thumbnail category')
    .sort({ enrolledAt: -1 });

  const rawEnrollments = await enrollmentsQuery.limit(200).lean();
  let studentRoster = rawEnrollments.filter((e) => Boolean(e.student));

  if (opts.search) {
    const q = opts.search.toLowerCase().trim();
    studentRoster = studentRoster.filter((e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = e.student as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = e.course as any;
      return (
        s?.name?.toLowerCase().includes(q) ||
        s?.email?.toLowerCase().includes(q) ||
        c?.title?.toLowerCase().includes(q)
      );
    });
  }

  const total = studentRoster.length;
  const skip = opts.skip || 0;
  const limit = opts.limit || 20;
  const paged = studentRoster.slice(skip, skip + limit);

  const studentRows = paged.map((e) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = e.student as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = e.course as any;
    return {
      enrollmentId: String(e._id),
      student: {
        _id: String(s._id),
        name: s.name || 'Student',
        email: s.email || '',
        avatar: s.avatar,
      },
      course: {
        _id: String(c._id),
        title: c?.title || 'Course',
        thumbnail: c?.thumbnail,
      },
      progress: e.progress || 0,
      status: e.status || 'active',
      lessonCompletedCount: e.lessonCompletedCount || 0,
      enrolledAt: e.enrolledAt ? new Date(e.enrolledAt).toISOString() : '',
      completedAt: e.completedAt ? new Date(e.completedAt).toISOString() : undefined,
    };
  });

  const metrics = enrollmentsAgg[0] || { total: 0, active: 0, completed: 0, avgProgress: 0 };
  const attempts = attemptStats[0] || { totalAttempts: 0, avgScore: 0, passedAttempts: 0 };

  const completionRate = metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;

  return {
    overall: {
      totalStudents: totalUsers,
      totalCourses,
      totalEnrollments: metrics.total || 0,
      activeEnrollments: metrics.active || 0,
      completedEnrollments: metrics.completed || 0,
      completionRate,
      averageProgress: Math.round(metrics.avgProgress || 0),
      totalQuizzesTaken: attempts.totalAttempts || 0,
      platformAverageScore: Math.round(attempts.avgScore || 0),
      quizzesPassed: attempts.passedAttempts || 0,
    },
    courseHealth,
    students: studentRows,
    total,
  };
}
