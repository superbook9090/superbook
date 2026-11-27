import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Contest, { IContest } from '@/models/Contest';
import { createContestSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { getCachedData, setCachedData, invalidatePattern } from '@/lib/redis';
import { requireFeature } from '@/lib/settingsHelpers';
import type { AccessUser } from '@/lib/accessControl';
import {
  getContestComputedState,
  canTeacherManageContests,
} from '@/lib/contest/contestHelpers';
import {
  buildContestListQuery,
  getStudentAttemptMap,
  getContestTabCounts,
} from '@/lib/contest/contestQuery';
import {
  buildContestQuizRefs,
  broadcastNewContest,
} from '@/lib/contest/contestCreation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// GET /api/contests - List contests with filter tabs & search
export async function GET(request: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/contests' };

  try {
    const featureCheck = await requireFeature('enableContests');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (session?.user) {
      logContext.userId = session.user.id;
    }
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab');
    const scheduleType = searchParams.get('scheduleType');
    const instructor = searchParams.get('instructor');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const orgId =
      session?.user?.role === 'superadmin'
        ? 'superadmin'
        : session?.user?.organizationId || 'public';
    const now = new Date();

    const { query, isTeacherSelf, isAdminAll } = buildContestListQuery(
      session,
      { tab, scheduleType, instructor, search },
      now
    );

    const cacheKey = `contests:${orgId}:${tab || 'all'}:${scheduleType || 'all'}:${instructor || 'all'}:${search || ''}:${page}:${limit}`;
    const canUseBaseCache = !isTeacherSelf && !isAdminAll && !search;

    if (canUseBaseCache) {
      const cached = await getCachedData<{
        contests: Array<Record<string, unknown> & { _id: string }>;
        pagination: { page: number; limit: number; total: number; totalPages: number };
        stats: { liveCount: number; upcomingCount: number; completedCount: number };
      }>(cacheKey);

      if (cached) {
        if (session?.user?.id && session.user.role === 'student' && cached.contests.length > 0) {
          const contestIds = cached.contests.map((c) => c._id);
          const studentAttemptMap = await getStudentAttemptMap(session.user.id, contestIds);
          return NextResponse.json(
            {
              ...cached,
              contests: cached.contests.map((c) => ({
                ...c,
                userAttempt: studentAttemptMap[c._id] || null,
              })),
            },
            { status: 200 }
          );
        }
        return NextResponse.json(cached, { status: 200 });
      }
    }

    const [contestsRaw, total] = await Promise.all([
      Contest.find(query)
        .populate('instructor', 'name avatar')
        .populate('quizzes.quiz', 'title questionCount timeLimit createdAt')
        .sort({ startTime: tab === 'completed' ? -1 : 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IContest[]>(),
      Contest.countDocuments(query),
    ]);

    const contestIds = contestsRaw.map((c) => c._id);
    const attemptCountMap: Record<string, number> = {};

    if (contestIds.length > 0) {
      const ContestAttempt = (await import('@/models/ContestAttempt')).default;
      const attemptCountsAggregate = await ContestAttempt.aggregate([
        { $match: { contest: { $in: contestIds } } },
        {
          $group: {
            _id: '$contest',
            students: { $addToSet: '$student' },
            total: { $sum: 1 },
          },
        },
      ]);

      attemptCountsAggregate.forEach((item) => {
        attemptCountMap[item._id.toString()] = item.students ? item.students.length : item.total;
      });
    }

    const baseContests = contestsRaw.map((c) => {
      const quizDates = (c.quizzes ?? []).map((q) => {
        const date = (q.quiz as { createdAt?: string | Date })?.createdAt;
        return date ? new Date(date).getTime() : 0;
      });
      const latestQuizTimestamp = quizDates.length ? Math.max(...quizDates) : 0;

      return {
        ...c,
        computedState: getContestComputedState(c, now),
        userAttempt: null,
        attemptCount: attemptCountMap[c._id.toString()] || 0,
        latestQuizTimestamp,
      };
    });

    // Sort descending by latest quiz date
    baseContests.sort((a, b) => b.latestQuizTimestamp - a.latestQuizTimestamp);

    const { liveCount, upcomingCount, completedCount } = await getContestTabCounts(
      session,
      Boolean(isTeacherSelf),
      Boolean(isAdminAll),
      now
    );

    const baseResponseData = {
      contests: serialize(baseContests) as Array<Record<string, unknown> & { _id: string }>,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        liveCount,
        upcomingCount,
        completedCount,
      },
    };

    if (canUseBaseCache) {
      await setCachedData(cacheKey, baseResponseData, 60);
    }

    const studentAttemptMap =
      session?.user?.id && session.user.role === 'student' && contestIds.length > 0
        ? await getStudentAttemptMap(session.user.id, contestIds)
        : {};

    const responseData =
      Object.keys(studentAttemptMap).length > 0
        ? {
            ...baseResponseData,
            contests: baseResponseData.contests.map((c) => ({
              ...c,
              userAttempt: studentAttemptMap[c._id] || null,
            })),
          }
        : baseResponseData;

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/contests', logContext);
    return NextResponse.json(
      { message: 'Failed to fetch contests. Please try again.' },
      { status: 500 }
    );
  }
}

// POST /api/contests - Create a new contest (Authorized Teacher / Superadmin only)
export async function POST(request: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/contests' };

  try {
    const featureCheck = await requireFeature('enableContests');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    await dbConnect();
    const isAuthorized = await canTeacherManageContests(session.user.id, session.user.role);
    if (!isAuthorized) {
      return NextResponse.json(
        { message: 'You do not have permission to create contests. Please contact a Superadmin.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validationResult = createContestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid contest data', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      instructions,
      startTime,
      endTime,
      duration,
      solutionsReleaseAt,
      scheduleType = 'one_time',
      prizes = [],
      maxAttempts = 1,
      maxParticipants = null,
      visibility: requestedVisibility,
      leaderboardVisibility = 'live',
      enableNegativeMarking,
      negativeMarks,
      quizzes: rawQuizzes = [],
      questions: rawQuestions = [],
      notifyAllStudents = false,
      slug,
      metaTitle,
      metaDescription,
    } = validationResult.data;

    const visibility =
      requestedVisibility ?? (session.user.organizationId ? 'organization' : 'public');

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ message: 'Invalid start or end date' }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json({ message: 'End time must be after start time' }, { status: 400 });
    }

    const solutionDate = solutionsReleaseAt ? new Date(solutionsReleaseAt) : endDate;

    const quizRefsResult = await buildContestQuizRefs({
      title,
      description,
      duration,
      enableNegativeMarking,
      negativeMarks,
      userId: session.user.id,
      userRole: session.user.role as AccessUser['role'],
      organizationId: session.user.organizationId,
      rawQuestions,
      rawQuizzes,
    });

    if (quizRefsResult.error) {
      return NextResponse.json(
        { message: quizRefsResult.error },
        { status: quizRefsResult.status || 403 }
      );
    }

    const { contestQuizRefs, totalQuestions, totalPoints } = quizRefsResult;

    if (contestQuizRefs.length === 0 || totalQuestions === 0) {
      return NextResponse.json(
        { message: 'Contest must contain at least one quiz or question set' },
        { status: 400 }
      );
    }

    const contest = new Contest({
      title,
      description,
      instructions,
      instructor: session.user.id,
      organizationId: session.user.organizationId || null,
      quizzes: contestQuizRefs,
      scheduleType,
      prizes,
      status: 'published',
      startTime: startDate,
      endTime: endDate,
      duration,
      solutionsReleaseAt: solutionDate,
      maxAttempts,
      maxParticipants,
      visibility,
      leaderboardVisibility,
      enableNegativeMarking: !!enableNegativeMarking,
      negativeMarks: typeof negativeMarks === 'number' ? negativeMarks : 0,
      questionCount: totalQuestions,
      totalPoints,
      slug,
      metaTitle,
      metaDescription,
    });

    await contest.save();
    await invalidatePattern('contests:*');

    let notificationSummary = null;
    if (notifyAllStudents) {
      notificationSummary = await broadcastNewContest(contest._id, title, {
        organizationId: contest.organizationId,
        creatorRole: session.user.role,
      });
    }

    const created = await Contest.findById(contest._id)
      .populate('instructor', 'name avatar')
      .populate('quizzes.quiz', 'title questionCount timeLimit')
      .lean();

    return NextResponse.json(
      {
        message: 'Contest created successfully',
        contest: serialize(created),
        ...(notificationSummary ? { notificationSummary } : {}),
      },
      { status: 201 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/contests', logContext);
    return NextResponse.json(
      { message: 'Failed to create contest. Please try again.' },
      { status: 500 }
    );
  }
}
