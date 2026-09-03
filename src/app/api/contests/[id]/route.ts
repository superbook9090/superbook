import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Contest, { IContest } from '@/models/Contest';
import ContestAttempt from '@/models/ContestAttempt';
import { updateContestSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { invalidatePattern } from '@/lib/redis';
import { listQuestionsForQuiz } from '@/domain/learning/quizContent';
import {
  getContestComputedState,
} from '@/lib/contest/contestHelpers';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// GET /api/contests/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'GET', path: `/api/contests/${id}` };

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid contest ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (session?.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const contest = await Contest.findById(id)
      .populate('instructor', 'name email avatar')
      .populate('quizzes.quiz', 'title questionCount timeLimit version')
      .lean<IContest>();

    if (!contest) {
      return NextResponse.json({ message: 'Contest not found' }, { status: 404 });
    }

    const now = new Date();
    const computedState = getContestComputedState(contest, now);

    const isInstructor =
      session?.user?.id &&
      (contest.instructor?._id?.toString() === session.user.id ||
        session.user.role === 'superadmin');

    // If teacher/admin requests details for editing or managing, load full question list
    const questionsForEditor: Array<{
      quizId: string;
      quizTitle: string;
      questions: unknown[];
    }> = [];

    if (isInstructor) {
      for (const qRef of contest.quizzes || []) {
        const qId = qRef.quiz?._id || qRef.quiz;
        if (qId) {
          const rows = await listQuestionsForQuiz(qId as mongoose.Types.ObjectId);
          questionsForEditor.push({
            quizId: qId.toString(),
            quizTitle: qRef.title || 'Quiz',
            questions: rows,
          });
        }
      }
    }

    // Check student attempt status
    let userAttempt = null;
    let attemptCount = 0;
    if (session?.user?.id && session.user.role === 'student') {
      const attempts = await ContestAttempt.find({
        contest: id,
        student: session.user.id,
      })
        .sort({ startedAt: -1 })
        .lean();

      attemptCount = attempts.length;
      if (attempts.length > 0) {
        userAttempt = attempts[0];
      }
    }

    return NextResponse.json(
      {
        contest: serialize({
          ...contest,
          computedState,
          userAttempt,
          attemptCount,
          ...(isInstructor ? { questionsForEditor } : {}),
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', `/api/contests/${id}`, logContext);
    return NextResponse.json(
      { message: 'Failed to fetch contest details' },
      { status: 500 }
    );
  }
}

// PATCH /api/contests/[id] - Update contest
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'PATCH', path: `/api/contests/${id}` };

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid contest ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    await dbConnect();

    const contest = await Contest.findById(id);
    if (!contest) {
      return NextResponse.json({ message: 'Contest not found' }, { status: 404 });
    }

    const isOwner = contest.instructor.toString() === session.user.id;
    const isSuperAdmin = session.user.role === 'superadmin';

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json(
        { message: 'You are not authorized to update this contest' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = updateContestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid update data', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updates = validationResult.data;
    const now = new Date();
    const currentState = getContestComputedState(contest, now);

    // If contest is already live or completed, restrict changing structural questions/duration
    if (currentState === 'live' || currentState === 'completed') {
      if (updates.duration && updates.duration !== contest.duration) {
        return NextResponse.json(
          { message: 'Cannot modify contest duration while contest is live or completed' },
          { status: 400 }
        );
      }
      if (updates.questions || updates.quizzes) {
        return NextResponse.json(
          { message: 'Cannot modify contest questions once contest has started' },
          { status: 400 }
        );
      }
    }

    if (updates.title) contest.title = updates.title;
    if (updates.description !== undefined) contest.description = updates.description;
    if (updates.instructions !== undefined) contest.instructions = updates.instructions;
    if (updates.startTime) contest.startTime = new Date(updates.startTime);
    if (updates.endTime) contest.endTime = new Date(updates.endTime);
    if (updates.duration && currentState === 'upcoming') contest.duration = updates.duration;
    if (updates.solutionsReleaseAt) contest.solutionsReleaseAt = new Date(updates.solutionsReleaseAt);
    if (updates.scheduleType) contest.scheduleType = updates.scheduleType;
    if (updates.prizes) contest.prizes = updates.prizes;
    if (updates.maxAttempts !== undefined) contest.maxAttempts = updates.maxAttempts;
    if (updates.maxParticipants !== undefined) contest.maxParticipants = updates.maxParticipants;
    if (updates.visibility) contest.visibility = updates.visibility;
    if (updates.leaderboardVisibility) contest.leaderboardVisibility = updates.leaderboardVisibility;
    if (updates.status) contest.status = updates.status;

    await contest.save();
    await invalidatePattern('contests:*');

    const fresh = await Contest.findById(id)
      .populate('instructor', 'name email avatar')
      .populate('quizzes.quiz', 'title questionCount timeLimit')
      .lean();

    return NextResponse.json(
      { message: 'Contest updated successfully', contest: serialize(fresh) },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'PATCH', `/api/contests/${id}`, logContext);
    return NextResponse.json(
      { message: 'Failed to update contest' },
      { status: 500 }
    );
  }
}

// DELETE /api/contests/[id] - Cancel / Delete contest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'DELETE', path: `/api/contests/${id}` };

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid contest ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const contest = await Contest.findById(id);
    if (!contest) {
      return NextResponse.json({ message: 'Contest not found' }, { status: 404 });
    }

    const isOwner = contest.instructor.toString() === session.user.id;
    const isSuperAdmin = session.user.role === 'superadmin';

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json(
        { message: 'You are not authorized to delete this contest' },
        { status: 403 }
      );
    }

    const attemptCount = await ContestAttempt.countDocuments({ contest: id });

    // If attempts already exist, soft-cancel rather than hard-deleting
    if (attemptCount > 0) {
      contest.status = 'cancelled';
      await contest.save();
    } else {
      await Contest.findByIdAndDelete(id);
    }

    await invalidatePattern('contests:*');

    return NextResponse.json(
      { message: attemptCount > 0 ? 'Contest has been cancelled' : 'Contest deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'DELETE', `/api/contests/${id}`, logContext);
    return NextResponse.json(
      { message: 'Failed to delete contest' },
      { status: 500 }
    );
  }
}
