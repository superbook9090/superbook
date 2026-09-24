import mongoose from 'mongoose';
import { Enrollment, QuizAttempt } from '@/models';

export async function getUserOverview(userId: string, role: string) {
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
