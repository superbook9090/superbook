import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';
import { claimChallengeSchema } from '@/lib/validation';
import { Challenge, ChallengeAttempt } from '@/models';

export async function POST(req: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/challenges/claim',
  };

  try {
    const featureGuard = await requireFeature('enableQuizChallenges');
    if (featureGuard) return featureGuard;

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
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    // Atomically claim only if not already converted
    const claimed = await ChallengeAttempt.findOneAndUpdate(
      { claimToken, converted: false },
      { $set: { opponentUser: userObjectId, converted: true } },
      { new: true }
    );

    if (claimed) {
      await Challenge.updateOne(
        { _id: claimed.challenge },
        { $inc: { conversionsCount: 1 } }
      );

      return NextResponse.json({
        success: true,
        message: 'Challenge attempt successfully linked to your account!',
        attemptId: claimed._id.toString(),
      });
    }

    const existing = (await ChallengeAttempt.findOne({ claimToken })
      .select('_id converted opponentUser')
      .lean()) as {
      _id: { toString(): string };
      converted?: boolean;
      opponentUser?: { toString(): string } | null;
    } | null;

    if (!existing) {
      return NextResponse.json({ message: 'Challenge attempt not found' }, { status: 404 });
    }

    if (existing.converted && existing.opponentUser?.toString() === session.user.id) {
      return NextResponse.json({
        success: true,
        message: 'Attempt already claimed by current user',
        attemptId: existing._id.toString(),
      });
    }

    return NextResponse.json(
      { message: 'This challenge attempt has already been claimed by another user' },
      { status: 409 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', logContext.path || '/api/challenges/claim', logContext);
    return NextResponse.json(
      { message: 'Failed to claim challenge attempt' },
      { status: 500 }
    );
  }
}
