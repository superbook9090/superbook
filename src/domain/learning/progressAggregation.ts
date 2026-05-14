import mongoose, { type Types } from 'mongoose';
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';

export async function aggregateStudentProgress(
  studentId: string,
  opts: { courseId?: string | null; skip: number; limit: number }
) {
  const sid = new mongoose.Types.ObjectId(studentId);
  const match: Record<string, unknown> = { student: sid };
  if (opts.courseId) match.course = new mongoose.Types.ObjectId(opts.courseId);

  const enrollments = await Enrollment.find(match)
    .populate('course', 'title description thumbnail category instructor price')
    .sort({ enrolledAt: -1 })
    .skip(opts.skip)
    .limit(opts.limit)
    .lean();

  if (enrollments.length === 0) {
    return { rows: [], overall: { totalCourses: 0, completedCourses: 0, inProgressCourses: 0, averageProgress: 0, totalQuizzesTaken: 0, overallAverageScore: 0 } };
  }

  const courseIds = enrollments.map((e) => (e.course as { _id: Types.ObjectId })._id);

  const [attemptAgg, quizCounts] = await Promise.all([
    QuizAttempt.aggregate<{
      _id: Types.ObjectId;
      completed: number;
      avgScore: number;
      maxScore: number;
      minScore: number;
    }>([
      {
        $match: {
          student: sid,
          course: { $in: courseIds },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$course',
          completed: { $sum: 1 },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' },
        },
      },
    ]),
    Quiz.aggregate<{ _id: Types.ObjectId; total: number }>([
      { $match: { course: { $in: courseIds }, isPublished: true } },
      { $group: { _id: '$course', total: { $sum: 1 } } },
    ]),
  ]);

  const byCourseAttempts = new Map(attemptAgg.map((a) => [a._id.toString(), a]));
  const byCourseQuizTotal = new Map(quizCounts.map((q) => [q._id.toString(), q.total]));

  const rows = enrollments.map((enrollment) => {
    const cid = (enrollment.course as { _id: Types.ObjectId })._id.toString();
    const stats = byCourseAttempts.get(cid);
    const totalQuizzes = byCourseQuizTotal.get(cid) ?? 0;
    return {
      enrollment: {
        _id: enrollment._id,
        progress: enrollment.progress,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        lessonCompletedCount: enrollment.lessonCompletedCount,
      },
      course: enrollment.course,
      quizStats: {
        total: totalQuizzes,
        completed: stats?.completed ?? 0,
        averageScore: stats ? Math.round(stats.avgScore || 0) : 0,
        highestScore: stats?.maxScore ?? 0,
        lowestScore: stats?.minScore ?? 0,
      },
    };
  });

  const completedCourses = enrollments.filter((e) => e.status === 'completed').length;
  const inProgressCourses = enrollments.filter((e) => e.status === 'active').length;
  const averageProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
      : 0;

  const totalAttempts = attemptAgg.reduce((s, a) => s + a.completed, 0);
  const scoreParts = attemptAgg.filter((a) => (a.avgScore || 0) > 0);
  const overallAverageScore =
    scoreParts.length > 0
      ? Math.round(scoreParts.reduce((s, a) => s + Math.round(a.avgScore || 0), 0) / scoreParts.length)
      : 0;

  return {
    rows,
    overall: {
      totalCourses: enrollments.length,
      completedCourses,
      inProgressCourses,
      averageProgress,
      totalQuizzesTaken: totalAttempts,
      overallAverageScore,
    },
  };
}
