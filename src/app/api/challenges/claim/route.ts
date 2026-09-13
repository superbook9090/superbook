import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { logApiError, type LogContext } from '@/lib/logger';
import { claimChallengeSchema } from '@/lib/validation';
import { Challenge, ChallengeAttempt } from '@/models';

export async function POST(req: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/challenges/claim',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    const body = await req.json();
    const validation = claimChallengeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid claim token', errors: validation.error.issues },
        { status: 400 }
      );
    }

    await dbConnect();
    const { claimToken } = validation.data;

    const attempt = await ChallengeAttempt.findOne({ claimToken });
    if (!attempt) {
      return NextResponse.json({ message: 'Challenge attempt not found' }, { status: 404 });
    }

    if (attempt.converted && attempt.opponentUser?.toString() === session.user.id) {
      return NextResponse.json({
        success: true,
        message: 'Attempt already claimed by current user',
        attemptId: attempt._id.toString(),
      });
    }

    // Link user and mark converted
    const wasAlreadyConverted = attempt.converted;
    attempt.opponentUser = new mongoose.Types.ObjectId(session.user.id);
    attempt.converted = true;
    await attempt.save();

    // Increment conversion count on parent challenge if not already counted
    if (!wasAlreadyConverted) {
      await Challenge.updateOne(
        { _id: attempt.challenge },
        { $inc: { conversionsCount: 1 } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Challenge attempt successfully linked to your account!',
      attemptId: attempt._id.toString(),
    });
  } catch (error) {
    logApiError(error as Error, 'POST', logContext.path || '/api/challenges/claim', logContext);
    return NextResponse.json(
      { message: 'Failed to claim challenge attempt' },
      { status: 500 }
    );
  }
}
