import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Contest, { IContest } from '@/models/Contest';
import { createContestAttemptSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import {
  getContestAttemptsWithStats,
  handleStartAttempt,
  handleSubmitAttempt,
} from '@/lib/contest/contestAttemptService';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// GET /api/contests/[id]/attempts - Teacher/Admin lists attempts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'GET', path: `/api/contests/${id}/attempts` };

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

    const contest = await Contest.findById(id).lean<IContest>();
    if (!contest) {
      return NextResponse.json({ message: 'Contest not found' }, { status: 404 });
    }

    const isInstructor =
      contest.instructor.toString() === session.user.id ||
      session.user.role === 'superadmin' ||
      session.user.role === 'admin';

    if (!isInstructor) {
      return NextResponse.json(
        { message: 'Only instructors and admins can view all contest attempts' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page'), 10);
    const limit = parseInt(searchParams.get('limit'), 10);

    const { attemptsRaw, pagination, stats } = await getContestAttemptsWithStats(id, page, limit);

    return NextResponse.json(
      {
        attempts: serialize(attemptsRaw),
        pagination,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', `/api/contests/${id}/attempts`, logContext);
    return NextResponse.json(
      { message: 'Failed to fetch contest attempts' },
      { status: 500 }
    );
  }
}

// POST /api/contests/[id]/attempts - Start or Submit contest attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'POST', path: `/api/contests/${id}/attempts` };

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid contest ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    if (session.user.role !== 'student') {
      return NextResponse.json(
        { message: 'Only students can participate in contests' },
        { status: 403 }
      );
    }

    await dbConnect();

    const contest = await Contest.findById(id).lean<IContest>();
    if (!contest) {
      return NextResponse.json({ message: 'Contest not found' }, { status: 404 });
    }

    if (contest.status === 'cancelled' || contest.status === 'draft') {
      return NextResponse.json(
        { message: 'This contest is not available' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = createContestAttemptSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const now = new Date();
    const { action, answers: submittedAnswers = [], timeTaken, violationCount = 0 } =
      validationResult.data;

    if (action === 'start') {
      const res = await handleStartAttempt(contest, session.user.id, session.user.organizationId, now);
      if (res.status !== 200 && res.status !== 201) {
        return NextResponse.json({ message: res.message }, { status: res.status });
      }
      return NextResponse.json(
        {
          message: res.message,
          attempt: serialize(res.attempt),
          questions: res.questions,
          timeRemaining: res.timeRemaining,
          duration: res.duration,
          endTime: res.endTime,
          enableNegativeMarking: res.enableNegativeMarking,
          negativeMarks: res.negativeMarks,
        },
        { status: res.status }
      );
    }

    if (action === 'submit') {
      const res = await handleSubmitAttempt(
        contest,
        session.user.id,
        { submittedAnswers, timeTaken, violationCount },
        now
      );
      if (res.status !== 200) {
        return NextResponse.json({ message: res.message }, { status: res.status });
      }
      return NextResponse.json(
        {
          message: res.message,
          result: res.result,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logApiError(error as Error, 'POST', `/api/contests/${id}/attempts`, logContext);
    return NextResponse.json(
      { message: 'Failed to process contest attempt' },
      { status: 500 }
    );
  }
}
