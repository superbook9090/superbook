import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import Course, { ICourse } from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { validateContentAccess, canManageOrgContent, type AccessUser } from '@/lib/accessControl';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    await dbConnect();

    // Check if user has access to this course
    const course = (await Course.findById(courseId).lean()) as ICourse | null;
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const authUser: AccessUser = {
      _id: new mongoose.Types.ObjectId(session.user.id),
      organizationId: session.user.organizationId
        ? new mongoose.Types.ObjectId(session.user.organizationId)
        : null,
      role: session.user.role as AccessUser['role'],
    };

    try {
      validateContentAccess(course.organizationId, authUser, 'course');
    } catch {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const canManage = canManageOrgContent(course.organizationId, course.instructor, authUser);

    if (!canManage) {
      if (!course.isPublished) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      if (course.courseCode) {
        const enrollment = await Enrollment.findOne({
          student: new mongoose.Types.ObjectId(session.user.id),
          course: new mongoose.Types.ObjectId(courseId),
        }).lean();

        if (!enrollment) {
          return NextResponse.json(
            { error: 'You must be enrolled in this private course to view its leaderboard' },
            { status: 403 }
          );
        }
      }
    }

    const courseOid = new mongoose.Types.ObjectId(courseId);

    const [packed] = await QuizAttempt.aggregate([
      { $match: { course: courseOid, status: 'completed' } },
      {
        $facet: {
          meta: [
            {
              $group: {
                _id: null,
                students: { $addToSet: '$student' },
                quizzes: { $addToSet: '$quiz' },
              },
            },
            {
              $project: {
                _id: 0,
                totalStudents: { $size: '$students' },
                totalQuizzes: { $size: '$quizzes' },
              },
            },
          ],
          leaderboard: [
            {
              $group: {
                _id: '$student',
                totalScore: { $sum: '$score' },
                quizCount: { $sum: 1 },
                averageScore: { $avg: '$score' },
                bestScore: { $max: '$score' },
                completedQuizzes: { $sum: 1 },
                lastCompletedAt: { $max: '$submittedAt' },
              },
            },
            {
              $lookup: {
                from: 'users',
                let: { sid: '$_id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$sid'] } } },
                  { $project: { name: 1, avatar: 1 } },
                ],
                as: 'user',
              },
            },
            { $unwind: '$user' },
            {
              $project: {
                userId: '$_id',
                name: { $ifNull: ['$user.name', 'Anonymous'] },
                image: { $ifNull: ['$user.avatar', null] },
                totalScore: '$totalScore',
                averageScore: { $round: ['$averageScore', 2] },
                bestScore: '$bestScore',
                quizCount: '$quizCount',
                completedQuizzes: '$completedQuizzes',
                rank: { $literal: 0 },
                lastCompletedAt: '$lastCompletedAt',
              },
            },
            { $sort: { totalScore: -1, lastCompletedAt: 1 } },
            { $limit: 50 },
          ],
        },
      },
    ]);

    const meta = packed?.meta?.[0] || { totalStudents: 0, totalQuizzes: 0 };
    const leaderboard = packed?.leaderboard ?? [];

    const rankedLeaderboard = leaderboard.map((entry: Record<string, unknown>, index: number) => ({
      ...entry,
      rank: index + 1,
    }));

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      course: {
        id: courseId,
        title: course.title,
        totalStudents: meta.totalStudents ?? 0,
        totalQuizzes: meta.totalQuizzes ?? 0,
      },
    });

  } catch (error) {
    console.error('[LEADERBOARD] Course leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course leaderboard' },
      { status: 500 }
    );
  }
}
