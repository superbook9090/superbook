import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Contest from '@/models/Contest';
import { logApiError, type LogContext } from '@/lib/logger';
import { invalidatePattern } from '@/lib/redis';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// POST /api/contests/[id]/end - End contest early (Teacher/Superadmin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'POST', path: `/api/contests/${id}/end` };

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

    const isInstructor =
      contest.instructor.toString() === session.user.id ||
      session.user.role === 'superadmin';

    if (!isInstructor) {
      return NextResponse.json(
        { message: 'You are not authorized to end this contest' },
        { status: 403 }
      );
    }

    const now = new Date();
    contest.status = 'completed';
    contest.endTime = now;
    if (contest.solutionsReleaseAt && contest.solutionsReleaseAt > now) {
      // Release solutions immediately on manual end
      contest.solutionsReleaseAt = now;
    }

    await contest.save();
    await invalidatePattern('contests:*');

    return NextResponse.json(
      { message: 'Contest has been concluded successfully' },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', `/api/contests/${id}/end`, logContext);
    return NextResponse.json(
      { message: 'Failed to end contest' },
      { status: 500 }
    );
  }
}
