import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { validateContentAccess, canManageOrgContent, type AccessUser } from '@/lib/accessControl';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = await params;
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    await dbConnect();

    // Verify the quiz exists
    const quiz = (await Quiz.findById(quizId)
      .select('title isPublished instructor organizationId course')
      .lean()) as {
      title?: string;
      isPublished?: boolean;
      instructor?: mongoose.Types.ObjectId;
      organizationId?: mongoose.Types.ObjectId | null;
      course?: mongoose.Types.ObjectId | null;
    } | null;
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const authUser: AccessUser = {
      _id: new mongoose.Types.ObjectId(session.user.id),
      organizationId: session.user.organizationId
        ? new mongoose.Types.ObjectId(session.user.organizationId)
        : null,
      role: session.user.role as AccessUser['role'],
    };

    try {
      validateContentAccess(quiz.organizationId, authUser, 'quiz');
    } catch {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const canManage = canManageOrgContent(quiz.organizationId, quiz.instructor, authUser);

    if (!canManage) {
      if (!quiz.isPublished) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      if (quiz.course && mongoose.Types.ObjectId.isValid(String(quiz.course))) {
        const course = await Course.findById(quiz.course)
          .select('isPublished courseCode organizationId')
          .lean<{
            isPublished?: boolean;
            courseCode?: string | null;
            organizationId?: mongoose.Types.ObjectId | null;
          }>();

        if (course) {
          try {
            validateContentAccess(course.organizationId, authUser, 'course');
          } catch {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          if (!course.isPublished) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }

          if (course.courseCode) {
            const enrollment = await Enrollment.findOne({
              student: new mongoose.Types.ObjectId(session.user.id),
              course: quiz.course,
            }).lean();

            if (!enrollment) {
              return NextResponse.json(
                { error: 'You must be enrolled in this private course to view this leaderboard' },
                { status: 403 }
              );
            }
          }
        }
      }
    }

    const quizObjectId = new mongoose.Types.ObjectId(quizId);

    const [facetResult] = await QuizAttempt.aggregate([
      {
        $facet: {
          meta: [
            { $match: { quiz: quizObjectId, status: 'completed' } },
            { $count: 'n' },
          ],
          leaderboard: [
            { $match: { quiz: quizObjectId, status: 'completed', attemptNumber: 1 } },
            {
              $lookup: {
                from: 'users',
                let: { sid: '$student' },
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
                userId: '$student',
                name: { $ifNull: ['$user.name', 'Anonymous'] },
                image: { $ifNull: ['$user.avatar', null] },
                score: '$score',
                rank: { $literal: 0 },
                completedAt: '$submittedAt',
                timeTaken: '$timeTaken',
                attemptNumber: '$attemptNumber',
              },
            },
            { $sort: { score: -1, timeTaken: 1, completedAt: 1 } },
            { $limit: 50 },
          ],
        },
      },
    ]);

    const totalAttempts = facetResult?.meta?.[0]?.n ?? 0;
    const leaderboard = facetResult?.leaderboard ?? [];

    const rankedLeaderboard = leaderboard.map((entry: Record<string, unknown>, index: number) => ({
      ...entry,
      rank: index + 1,
    }));

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      quiz: {
        id: quizId,
        title: quiz.title,
        totalAttempts,
      },
    });

  } catch (error) {
    console.error('[LEADERBOARD] Quiz leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz leaderboard' },
      { status: 500 }
    );
  }
}
