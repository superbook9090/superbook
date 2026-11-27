import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Contest from '@/models/Contest';
import { logApiError, type LogContext } from '@/lib/logger';
import { declareContestResults } from '@/lib/contests/declareResults';
import { requireFeature } from '@/lib/settingsHelpers';
import { canManageOrgContent, type AccessUser } from '@/lib/accessControl';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// POST /api/contests/[id]/end - End contest early (Teacher/Admin/Superadmin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'POST', path: `/api/contests/${id}/end` };

  try {
    const featureCheck = await requireFeature('enableContests');
    if (featureCheck) return featureCheck;

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

    const authUser: AccessUser = {
      _id: new mongoose.Types.ObjectId(session.user.id),
      organizationId: session.user.organizationId
        ? new mongoose.Types.ObjectId(session.user.organizationId)
        : null,
      role: session.user.role as AccessUser['role'],
    };

    if (!canManageOrgContent(contest.organizationId, contest.instructor, authUser)) {
      return NextResponse.json(
        { message: 'You are not authorized to end this contest' },
        { status: 403 }
      );
    }

    if (contest.status === 'completed') {
      return NextResponse.json(
        {
          message: 'Contest has already ended.',
          notificationsSent: 0,
        },
        { status: 200 }
      );
    }

    if (contest.status === 'draft' || contest.status === 'cancelled') {
      return NextResponse.json(
        { message: 'Cannot end a draft or cancelled contest' },
        { status: 400 }
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

    // Automatically declare results and notify all participating students (only if not already declared)
    const result = contest.resultsDeclared
      ? { notificationsSent: 0 }
      : await declareContestResults(id, { ignoreAge: true });

    return NextResponse.json(
      {
        message: 'Contest has been concluded successfully and results declared.',
        notificationsSent: result.notificationsSent,
      },
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
