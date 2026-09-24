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
import {
  getContestComputedState,
  canTeacherManageContests,
} from '@/lib/contest/contestHelpers';
import { isSuperAdmin } from '@/lib/roles';
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
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const orgId = session?.user?.organizationId || 'public';
    const now = new Date();

    const { query, isTeacherSelf, isAdminAll } = buildContestListQuery(
      session,
      { tab, scheduleType, instructor, search },
      now
    );

    const cacheKey = `contests:${orgId}:${tab || 'all'}:${scheduleType || 'all'}:${instructor || 'all'}:${search || ''}:${page}:${limit}`;
    if (!isTeacherSelf && !isAdminAll && !search) {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const [contestsRaw, total] = await Promise.all([
      Contest.find(query)
        .populate('instructor', 'name email avatar')
        .populate('quizzes.quiz', 'title questionCount timeLimit createdAt')
        .sort({ startTime: tab === 'completed' ? -1 : 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IContest[]>(),
      Contest.countDocuments(query),
    ]);

    const studentAttemptMap =
      session?.user?.id && session.user.role === 'student' && contestsRaw.length > 0
        ? await getStudentAttemptMap(session.user.id, contestsRaw.map((c) => c._id))
        : {};

    const contests = contestsRaw.map((c) => {
      const quizDates = (c.quizzes ?? []).map((q) => {
        const date = (q.quiz as { createdAt?: string | Date })?.createdAt;
        return date ? new Date(date).getTime() : 0;
      });
      const latestQuizTimestamp = quizDates.length ? Math.max(...quizDates) : 0;

      return {
        ...c,
        computedState: getContestComputedState(c, now),
        userAttempt: studentAttemptMap[c._id.toString()] || null,
        latestQuizTimestamp,
      };
    });

    // Sort descending by latest quiz date
    contests.sort((a, b) => b.latestQuizTimestamp - a.latestQuizTimestamp);

    const { liveCount, upcomingCount, completedCount } = await getContestTabCounts(
      session,
      Boolean(isTeacherSelf),
      Boolean(isAdminAll),
      now
    );

    const responseData = {
      contests: serialize(contests),
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

    if (!isTeacherSelf && !isAdminAll && !search) {
      await setCachedData(cacheKey, responseData, 60);
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    const isAuthorized = await canTeacherManageContests(session.user.id, session.user.role);
    if (!isAuthorized) {
      return NextResponse.json(
        { message: 'You do not have permission to create contests. Please contact a Superadmin.' },
        { status: 403 }
      );
    }

    await dbConnect();
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
      visibility = 'public',
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

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ message: 'Invalid start or end date' }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json({ message: 'End time must be after start time' }, { status: 400 });
    }

    const solutionDate = solutionsReleaseAt ? new Date(solutionsReleaseAt) : endDate;

    const { contestQuizRefs, totalQuestions, totalPoints } = await buildContestQuizRefs({
      title,
      description,
      duration,
      enableNegativeMarking,
      negativeMarks,
      userId: session.user.id,
      organizationId: session.user.organizationId,
      rawQuestions,
      rawQuizzes,
    });

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

    if (notifyAllStudents && isSuperAdmin(session.user.role)) {
      await broadcastNewContest(contest._id, title);
    }

    const created = await Contest.findById(contest._id)
      .populate('instructor', 'name email avatar')
      .populate('quizzes.quiz', 'title questionCount timeLimit')
      .lean();

    return NextResponse.json(
      { message: 'Contest created successfully', contest: serialize(created) },
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
