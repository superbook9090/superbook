import mongoose, { type Types } from 'mongoose';
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';
import Course from '@/models/Course';

export async function aggregateTeacherProgress(
  teacherId: string,
  opts: { courseId?: string | null; search?: string | null; skip?: number; limit?: number }
) {
  const tid = new mongoose.Types.ObjectId(teacherId);
  const courses = await Course.find({ instructor: tid })
    .select('_id title thumbnail category isPublished')
    .sort({ createdAt: -1 })
    .lean();

  if (courses.length === 0) {
    return {
      courses: [],
      students: [],
      overall: {
        totalCourses: 0,
        totalStudents: 0,
        totalEnrollments: 0,
        completedEnrollments: 0,
        averageProgress: 0,
        strugglingCount: 0,
        averageScore: 0,
      },
      total: 0,
    };
  }

  const courseIds = courses.map((c) => c._id);
  const targetCourseIds = opts.courseId ? [new mongoose.Types.ObjectId(opts.courseId)] : courseIds;

  const enrollMatch: Record<string, unknown> = { course: { $in: targetCourseIds } };

  const [allEnrollments, attemptAgg] = await Promise.all([
    Enrollment.find(enrollMatch)
      .populate('student', 'name email avatar')
      .populate('course', 'title thumbnail category')
      .sort({ updatedAt: -1, enrolledAt: -1 })
      .lean(),
    QuizAttempt.aggregate<{ _id: Types.ObjectId; avgScore: number; count: number }>([
      { $match: { course: { $in: targetCourseIds }, status: 'completed' } },
      { $group: { _id: '$course', avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
    ]),
  ]);

  let filtered = allEnrollments.filter((e) => Boolean(e.student));

  if (opts.search) {
    const q = opts.search.toLowerCase().trim();
    filtered = filtered.filter((e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = e.student as any;
      return (
        s?.name?.toLowerCase().includes(q) ||
        s?.email?.toLowerCase().includes(q)
      );
    });
  }

  const total = filtered.length;
  const skip = opts.skip || 0;
  const limit = opts.limit || 20;
  const paged = filtered.slice(skip, skip + limit);

  const studentRows = paged.map((e) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = e.student as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = e.course as any;
    return {
      enrollmentId: String(e._id),
      student: {
        _id: String(s._id),
        name: s.name || 'Unknown Student',
        email: s.email || '',
        avatar: s.avatar,
      },
      course: {
        _id: String(c._id),
        title: c.title,
        thumbnail: c.thumbnail,
      },
      progress: e.progress || 0,
      status: e.status || 'active',
      lessonCompletedCount: e.lessonCompletedCount || 0,
      enrolledAt: e.enrolledAt ? new Date(e.enrolledAt).toISOString() : '',
      completedAt: e.completedAt ? new Date(e.completedAt).toISOString() : undefined,
    };
  });

  const uniqueStudentIds = new Set(allEnrollments.map((e) => (e.student as { _id: Types.ObjectId })?._id?.toString()).filter(Boolean));
  const completedCount = allEnrollments.filter((e) => e.status === 'completed').length;
  const strugglingCount = allEnrollments.filter((e) => (e.progress || 0) < 25).length;
  const avgProg =
    allEnrollments.length > 0
      ? Math.round(allEnrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / allEnrollments.length)
      : 0;

  const totalScoreAttempts = attemptAgg.reduce((acc, a) => acc + a.count, 0);
  const avgClassScore =
    totalScoreAttempts > 0
      ? Math.round(attemptAgg.reduce((acc, a) => acc + a.avgScore * a.count, 0) / totalScoreAttempts)
      : 0;

  return {
    courses: courses.map((c) => ({
      _id: String(c._id),
      title: c.title,
      thumbnail: c.thumbnail,
      category: c.category,
    })),
    students: studentRows,
    overall: {
      totalCourses: courses.length,
      totalStudents: uniqueStudentIds.size,
      totalEnrollments: allEnrollments.length,
      completedEnrollments: completedCount,
      averageProgress: avgProg,
      strugglingCount,
      averageScore: avgClassScore,
    },
    total,
  };
}
