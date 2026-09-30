import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Contest from '@/models/Contest';
import { declareContestResults } from '@/lib/contests/declareResults';
import { logApiError, type LogContext } from '@/lib/logger';
import { isSuperAdmin } from '@/lib/roles';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// POST /api/contests/[id]/declare-results - Declare contest results and notify students (Superadmin / Teacher only)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'POST', path: `/api/contests/${id}/declare-results` };

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

    const isAuthorized =
      isSuperAdmin(session.user.role) ||
      session.user.role === 'superadmin' ||
      contest.instructor?.toString() === session.user.id;

    if (!isAuthorized) {
      return NextResponse.json(
        { message: 'You are not authorized to declare results for this contest' },
        { status: 403 }
      );
    }

    const result = await declareContestResults(id, { ignoreAge: true });

    return NextResponse.json({
      success: true,
      message: `Results declared successfully! Notifications sent to ${result.notificationsSent} participants.`,
      notificationsSent: result.notificationsSent,
    });
  } catch (error) {
    logApiError(error as Error, 'POST', `/api/contests/${id}/declare-results`, logContext);
    return NextResponse.json(
      { message: 'Failed to declare contest results' },
      { status: 500 }
    );
  }
}
