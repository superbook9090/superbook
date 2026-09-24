import mongoose from 'mongoose';
import { Course, QuizAttempt } from '@/models';

interface CourseStatItem {
  _id: unknown;
  title: string;
  isPublished: boolean;
  students: number;
  quizzes: number;
  attempts: number;
  averageScore: number;
  quizIds?: unknown[];
}

interface TopStudentAggItem {
  name: string;
  totalScore: number;
  attempts: number;
  averageScore: number;
}

export async function getTeacherStats(teacherId: string) {
  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return {
      courses: [],
      overview: {
        totalCourses: 0,
        totalStudents: 0,
        totalQuizzes: 0,
        totalAttempts: 0,
        averageScore: 0,
        publishedCourses: 0,
      },
      topStudents: [],
    };
  }

  const courseStats = await Course.aggregate([
    { $match: { instructor: new mongoose.Types.ObjectId(teacherId) } },
    {
      $lookup: {
        from: 'enrollments',
        localField: '_id',
        foreignField: 'course',
        as: 'enrollments',
      },
    },
    {
      $lookup: {
        from: 'quizzes',
        localField: '_id',
        foreignField: 'course',
        as: 'quizzes',
      },
    },
    {
      $lookup: {
        from: 'quizattempts',
        localField: 'quizzes._id',
        foreignField: 'quiz',
        as: 'attempts',
      },
    },
    {
      $addFields: {
        enrollmentCount: { $size: '$enrollments' },
        quizCount: { $size: '$quizzes' },
        completedAttempts: {
          $filter: {
            input: '$attempts',
            as: 'attempt',
            cond: { $eq: ['$$attempt.status', 'completed'] },
          },
        },
      },
    },
    {
      $addFields: {
        attemptCount: { $size: '$completedAttempts' },
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

  const quizIdsForTop = courseStats.flatMap((c: CourseStatItem) => c.quizIds || []);
  const courses = courseStats.map((course: CourseStatItem) => {
    const sanitized = { ...course };
    delete sanitized.quizIds;
    return sanitized;
  });

  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c: CourseStatItem) => c.isPublished).length;
  const totalStudents = courses.reduce((sum: number, c: CourseStatItem) => sum + c.students, 0);
  const totalQuizzes = courses.reduce((sum: number, c: CourseStatItem) => sum + c.quizzes, 0);
  const totalAttempts = courses.reduce((sum: number, c: CourseStatItem) => sum + c.attempts, 0);
  const averageScore =
    totalAttempts > 0
      ? Math.round(
          courses.reduce(
            (sum: number, c: CourseStatItem) => sum + c.averageScore * c.attempts,
            0
          ) / totalAttempts
        )
      : 0;

  const topStudents: TopStudentAggItem[] =
    quizIdsForTop.length === 0
      ? []
      : await QuizAttempt.aggregate([
          {
            $match: {
              quiz: { $in: quizIdsForTop },
              status: 'completed',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'student',
              foreignField: '_id',
              as: 'studentData',
            },
          },
          { $unwind: '$studentData' },
          {
            $group: {
              _id: '$student',
              name: { $first: '$studentData.name' },
              totalScore: { $sum: '$score' },
              attempts: { $sum: 1 },
            },
          },
          {
            $addFields: {
              averageScore: { $round: [{ $divide: ['$totalScore', '$attempts'] }, 0] },
            },
          },
          { $sort: { averageScore: -1 } },
          { $limit: 5 },
          {
            $project: {
              _id: 0,
              name: 1,
              totalScore: 1,
              attempts: 1,
              averageScore: 1,
            },
          },
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
