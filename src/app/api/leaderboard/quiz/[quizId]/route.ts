import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = await params;
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    await dbConnect();

    // Verify the quiz exists
    const quiz = (await Quiz.findById(quizId).select('title').lean()) as { title?: string } | null;
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
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
