import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Contest, { IContest } from '@/models/Contest';
import ContestAttempt from '@/models/ContestAttempt';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { getCachedData, setCachedData } from '@/lib/redis';
import { getContestComputedState } from '@/lib/contest/contestHelpers';
import { requireFeature } from '@/lib/settingsHelpers';
import { canManageOrgContent, type AccessUser } from '@/lib/accessControl';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

interface CachedLeaderboardPayload {
  leaderboard: Array<Record<string, unknown> & { userId?: string; rank: number }>;
  prizes: unknown[];
  totalParticipants: number;
  contest: {
    _id: string;
    title: string;
    status: string;
    totalPoints: number;
  };
}

// GET /api/contests/[id]/leaderboard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'GET', path: `/api/contests/${id}/leaderboard` };

  try {
    const featureCheck = await requireFeature('enableContests');
    if (featureCheck) return featureCheck;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid contest ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (session?.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const contest = await Contest.findById(id).lean<IContest>();
    if (!contest) {
      return NextResponse.json({ message: 'Contest not found' }, { status: 404 });
    }

    const now = new Date();
    const computedState = getContestComputedState(contest, now);

    const authUser: AccessUser | null = session?.user?.id
      ? {
          _id: new mongoose.Types.ObjectId(session.user.id),
          organizationId: session.user.organizationId
            ? new mongoose.Types.ObjectId(session.user.organizationId)
            : null,
          role: session.user.role as AccessUser['role'],
        }
      : null;

    const isInstructor = authUser
      ? canManageOrgContent(contest.organizationId, contest.instructor, authUser)
      : false;

    if ((contest.status === 'draft' || contest.status === 'cancelled') && !isInstructor) {
      return NextResponse.json({ message: 'Contest not found' }, { status: 404 });
    }

    if (contest.organizationId && contest.visibility === 'organization' && !isInstructor) {
      if (!authUser) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      if (
        !authUser.organizationId ||
        authUser.organizationId.toString() !== contest.organizationId.toString()
      ) {
        return NextResponse.json(
          { message: 'This contest is restricted to members of the organization' },
          { status: 403 }
        );
      }
    }

    // Check visibility setting
    if (!isInstructor) {
      if (contest.leaderboardVisibility === 'hidden') {
        return NextResponse.json(
          { message: 'Leaderboard is private for this contest', isHidden: true },
          { status: 200 }
        );
      }
      if (contest.leaderboardVisibility === 'after_end' && computedState !== 'completed') {
        return NextResponse.json(
          {
            message: 'Leaderboard will be released after the contest ends.',
            isLocked: true,
            leaderboard: [],
            prizes: contest.prizes || [],
          },
          { status: 200 }
        );
      }
    }

    const cacheKey = `contest-leaderboard:${id}`;
    if (computedState === 'completed') {
      const cached = await getCachedData<CachedLeaderboardPayload>(cacheKey);
      if (cached) {
        const userEntry = session?.user?.id
          ? cached.leaderboard.find((entry) => String(entry.userId) === session.user.id)
          : undefined;
        return NextResponse.json(
          {
            ...cached,
            userRank: userEntry ? userEntry.rank : null,
          },
          { status: 200 }
        );
      }
    }

    const contestObjectId = new mongoose.Types.ObjectId(id);

    // Aggregate completed attempts taking best score per student
    const rankedAttempts = await ContestAttempt.aggregate([
      { $match: { contest: contestObjectId, status: 'completed' } },
      // Sort best attempts first
      { $sort: { score: -1, timeTaken: 1, submittedAt: 1 } },
      // Group by student to take their best submission
      {
        $group: {
          _id: '$student',
          attemptId: { $first: '$_id' },
          score: { $first: '$score' },
          percentage: { $first: '$percentage' },
          timeTaken: { $first: '$timeTaken' },
          correctCount: { $first: '$correctCount' },
          totalQuestions: { $first: '$totalQuestions' },
          submittedAt: { $first: '$submittedAt' },
        },
      },
      { $sort: { score: -1, timeTaken: 1, submittedAt: 1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentDoc',
        },
      },
      { $unwind: { path: '$studentDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: '$_id',
          attemptId: 1,
          name: { $ifNull: ['$studentDoc.name', 'Contestant'] },
          avatar: { $ifNull: ['$studentDoc.avatar', null] },
          score: 1,
          percentage: 1,
          timeTaken: 1,
          correctCount: 1,
          totalQuestions: 1,
          submittedAt: 1,
        },
      },
    ]);

    // Map prizes to ranks
    const prizeMap = new Map();
    (contest.prizes || []).forEach((p) => {
      prizeMap.set(String(p.rank), p);
    });

    const leaderboard = rankedAttempts.map((entry, index) => {
      const rank = index + 1;
      const prize = prizeMap.get(String(rank)) || null;
      return {
        ...entry,
        rank,
        prize,
      };
    });

    const serializedLeaderboard = serialize(leaderboard) as Array<
      Record<string, unknown> & { userId?: string; rank: number }
    >;

    const baseResponseData: CachedLeaderboardPayload = {
      leaderboard: serializedLeaderboard,
      prizes: contest.prizes || [],
      totalParticipants: rankedAttempts.length,
      contest: {
        _id: contest._id.toString(),
        title: contest.title,
        status: computedState,
        totalPoints: contest.totalPoints,
      },
    };

    if (computedState === 'completed') {
      await setCachedData(cacheKey, baseResponseData, 300);
    }

    const userEntry = session?.user?.id
      ? serializedLeaderboard.find((entry) => String(entry.userId) === session.user.id)
      : undefined;

    return NextResponse.json(
      {
        ...baseResponseData,
        userRank: userEntry ? userEntry.rank : null,
      },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', `/api/contests/${id}/leaderboard`, logContext);
    return NextResponse.json(
      { message: 'Failed to fetch contest leaderboard' },
      { status: 500 }
    );
  }
}
