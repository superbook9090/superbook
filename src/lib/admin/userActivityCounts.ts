import mongoose from 'mongoose';
import Course from '@/models/Course';
import Quiz from '@/models/Quiz';
import Blog from '@/models/Blog';
import Contest from '@/models/Contest';
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';
import ContestAttempt from '@/models/ContestAttempt';
import Certificate from '@/models/Certificate';

export interface UserActivityStats {
  coursesCount?: number;
  publishedCoursesCount?: number;
  quizzesCount?: number;
  publishedQuizzesCount?: number;
  blogsCount?: number;
  contestsCount?: number;
  courseEnrollmentsCount?: number;
  enrolledCoursesCount?: number;
  completedCoursesCount?: number;
  quizAttemptsCount?: number;
  completedQuizAttemptsCount?: number;
  contestAttemptsCount?: number;
  certificatesCount?: number;
}

type UserLike = {
  _id: mongoose.Types.ObjectId | string;
  role?: string;
};

type IdCountRow = { _id: mongoose.Types.ObjectId; count: number };

function toObjectId(id: mongoose.Types.ObjectId | string): mongoose.Types.ObjectId {
  return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(String(id));
}

/**
 * Batch-fetches creation stats (for teachers & staff) and enrollment/attempt stats
 * (for students) for the given paginated slice of users using indexed $in aggregations.
 */
export async function attachUserActivityStats<T extends UserLike>(
  users: T[]
): Promise<Array<T & { activityStats: UserActivityStats }>> {
  if (users.length === 0) {
    return [];
  }

  const creatorIds: mongoose.Types.ObjectId[] = [];
  const studentIds: mongoose.Types.ObjectId[] = [];

  for (const user of users) {
    const oid = toObjectId(user._id);
    if (user.role === 'student') {
      studentIds.push(oid);
    } else {
      creatorIds.push(oid);
    }
  }

  const [
    courseRows,
    quizRows,
    blogRows,
    contestRows,
    enrollmentRows,
    quizAttemptRows,
    contestAttemptRows,
    certificateRows,
  ] = await Promise.all([
    creatorIds.length > 0
      ? Course.aggregate<{
          _id: mongoose.Types.ObjectId;
          coursesCount: number;
          publishedCoursesCount: number;
          courseEnrollmentsCount: number;
        }>([
          { $match: { instructor: { $in: creatorIds } } },
          {
            $group: {
              _id: '$instructor',
              coursesCount: { $sum: 1 },
              publishedCoursesCount: { $sum: { $cond: ['$isPublished', 1, 0] } },
              courseEnrollmentsCount: { $sum: { $ifNull: ['$enrolledCount', 0] } },
            },
          },
        ])
      : Promise.resolve([]),
    creatorIds.length > 0
      ? Quiz.aggregate<{
          _id: mongoose.Types.ObjectId;
          quizzesCount: number;
          publishedQuizzesCount: number;
        }>([
          { $match: { instructor: { $in: creatorIds } } },
          {
            $group: {
              _id: '$instructor',
              quizzesCount: { $sum: 1 },
              publishedQuizzesCount: { $sum: { $cond: ['$isPublished', 1, 0] } },
            },
          },
        ])
      : Promise.resolve([]),
    creatorIds.length > 0
      ? Blog.aggregate<IdCountRow>([
          { $match: { author: { $in: creatorIds } } },
          { $group: { _id: '$author', count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
    creatorIds.length > 0
      ? Contest.aggregate<IdCountRow>([
          { $match: { instructor: { $in: creatorIds } } },
          { $group: { _id: '$instructor', count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
    studentIds.length > 0
      ? Enrollment.aggregate<{
          _id: mongoose.Types.ObjectId;
          enrolledCoursesCount: number;
          completedCoursesCount: number;
        }>([
          { $match: { student: { $in: studentIds }, status: { $ne: 'dropped' } } },
          {
            $group: {
              _id: '$student',
              enrolledCoursesCount: { $sum: 1 },
              completedCoursesCount: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
              },
            },
          },
        ])
      : Promise.resolve([]),
    studentIds.length > 0
      ? QuizAttempt.aggregate<{
          _id: mongoose.Types.ObjectId;
          quizAttemptsCount: number;
          completedQuizAttemptsCount: number;
        }>([
          { $match: { student: { $in: studentIds } } },
          {
            $group: {
              _id: '$student',
              quizAttemptsCount: { $sum: 1 },
              completedQuizAttemptsCount: {
                $sum: {
                  $cond: [{ $in: ['$status', ['completed', 'force_submitted']] }, 1, 0],
                },
              },
            },
          },
        ])
      : Promise.resolve([]),
    studentIds.length > 0
      ? ContestAttempt.aggregate<IdCountRow>([
          { $match: { student: { $in: studentIds } } },
          { $group: { _id: '$student', count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
    studentIds.length > 0
      ? Certificate.aggregate<IdCountRow>([
          { $match: { student: { $in: studentIds } } },
          { $group: { _id: '$student', count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
  ]);

  const courseMap = new Map(courseRows.map((r) => [String(r._id), r]));
  const quizMap = new Map(quizRows.map((r) => [String(r._id), r]));
  const blogMap = new Map(blogRows.map((r) => [String(r._id), r.count]));
  const contestMap = new Map(contestRows.map((r) => [String(r._id), r.count]));
  const enrollmentMap = new Map(enrollmentRows.map((r) => [String(r._id), r]));
  const quizAttemptMap = new Map(quizAttemptRows.map((r) => [String(r._id), r]));
  const contestAttemptMap = new Map(contestAttemptRows.map((r) => [String(r._id), r.count]));
  const certificateMap = new Map(certificateRows.map((r) => [String(r._id), r.count]));

  return users.map((user) => {
    const id = String(user._id);
    if (user.role === 'student') {
      const enroll = enrollmentMap.get(id);
      const qAttempt = quizAttemptMap.get(id);
      return {
        ...user,
        activityStats: {
          enrolledCoursesCount: enroll?.enrolledCoursesCount ?? 0,
          completedCoursesCount: enroll?.completedCoursesCount ?? 0,
          quizAttemptsCount: qAttempt?.quizAttemptsCount ?? 0,
          completedQuizAttemptsCount: qAttempt?.completedQuizAttemptsCount ?? 0,
          contestAttemptsCount: contestAttemptMap.get(id) ?? 0,
          certificatesCount: certificateMap.get(id) ?? 0,
        },
      };
    }

    const course = courseMap.get(id);
    const quiz = quizMap.get(id);
    return {
      ...user,
      activityStats: {
        coursesCount: course?.coursesCount ?? 0,
        publishedCoursesCount: course?.publishedCoursesCount ?? 0,
        quizzesCount: quiz?.quizzesCount ?? 0,
        publishedQuizzesCount: quiz?.publishedQuizzesCount ?? 0,
        blogsCount: blogMap.get(id) ?? 0,
        contestsCount: contestMap.get(id) ?? 0,
        courseEnrollmentsCount: course?.courseEnrollmentsCount ?? 0,
      },
    };
  });
}
