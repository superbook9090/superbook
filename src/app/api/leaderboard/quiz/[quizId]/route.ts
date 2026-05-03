import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
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
    await dbConnect();

    // Check if user has access to this quiz
    const quiz = await QuizAttempt.findOne({ quiz: quizId }).lean();
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get leaderboard for this quiz - show only first attempts
    const leaderboard = await QuizAttempt.aggregate([
      { $match: { quiz: new mongoose.Types.ObjectId(quizId), status: 'completed', attemptNumber: 1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$student',
          name: { $ifNull: ['$user.name', 'Anonymous'] },
          image: { $ifNull: ['$user.avatar', null] },
          score: '$score',
          rank: { $literal: 0 }, // Will be set in next stage
          completedAt: '$submittedAt',
          timeTaken: '$timeTaken',
          attemptNumber: '$attemptNumber'
        }
      },
      { $sort: { score: -1, timeTaken: 1, completedAt: 1 } }, // Higher score first, then faster time, then earlier date
      { $limit: 50 } // Top 50
    ]);

    // Add rank numbers
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      quiz: {
        id: quizId,
        totalAttempts: await QuizAttempt.countDocuments({ quiz: quizId, status: 'completed' })
      }
    });

  } catch (error) {
    console.error('[LEADERBOARD] Quiz leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz leaderboard' },
      { status: 500 }
    );
  }
}
