import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Contest, { IContest } from '@/models/Contest';
import Quiz from '@/models/Quiz';
import ContestAttempt from '@/models/ContestAttempt';
import { createContestSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { getCachedData, setCachedData, invalidatePattern } from '@/lib/redis';
import { setQuizQuestions } from '@/domain/learning/quizContent';
import {
  getContestComputedState,
  canTeacherManageContests,
} from '@/lib/contest/contestHelpers';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

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
    const tab = searchParams.get('tab'); // 'live' | 'upcoming' | 'completed'
    const scheduleType = searchParams.get('scheduleType'); // 'one_time' | 'daily' | 'weekly'
    const instructor = searchParams.get('instructor');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const orgId = session?.user?.organizationId || 'public';
    const isTeacherSelf = instructor === 'self' && session?.user?.id;

    // Cache key for public/general listings
    const cacheKey = `contests:${orgId}:${tab || 'all'}:${scheduleType || 'all'}:${instructor || 'all'}:${search || ''}:${page}:${limit}`;
    if (!isTeacherSelf && !search) {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    // Teacher self-management query
    if (isTeacherSelf) {
      query.instructor = session.user.id;
    } else {
      // General student / public view: only published contests (exclude drafts/cancelled)
      query.status = { $in: ['published', 'completed'] };

      // Organization filter
      if (session?.user?.organizationId) {
        query.$or = [
          { organizationId: null },
          { organizationId: session.user.organizationId },
        ];
      } else {
        query.visibility = { $in: ['public', 'unlisted'] };
      }
    }

    if (scheduleType && ['one_time', 'daily', 'weekly'].includes(scheduleType)) {
      query.scheduleType = scheduleType;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Apply Tab Time Filter
    if (tab === 'live') {
      query.startTime = { $lte: now };
      query.endTime = { $gte: now };
      if (!isTeacherSelf) query.status = 'published';
    } else if (tab === 'upcoming') {
      query.startTime = { $gt: now };
      if (!isTeacherSelf) query.status = 'published';
    } else if (tab === 'completed') {
      query.$or = [{ endTime: { $lt: now } }, { status: 'completed' }];
    }

    const [contestsRaw, total] = await Promise.all([
      Contest.find(query)
        .populate('instructor', 'name email avatar')
        .populate('quizzes.quiz', 'title questionCount timeLimit')
        .sort({ startTime: tab === 'completed' ? -1 : 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IContest[]>(),
      Contest.countDocuments(query),
    ]);

    // Compute dynamic states & student participation info
    const studentAttemptMap: Record<string, { status: string; score: number; percentage: number }> = {};
    if (session?.user?.id && session.user.role === 'student' && contestsRaw.length > 0) {
      const contestIds = contestsRaw.map((c) => c._id);
      const studentAttempts = await ContestAttempt.find({
        student: session.user.id,
        contest: { $in: contestIds },
      })
        .select('contest status score percentage attemptNumber')
        .sort({ attemptNumber: -1 })
        .lean();

      studentAttempts.forEach((att) => {
        const cId = att.contest.toString();
        if (!studentAttemptMap[cId]) {
          studentAttemptMap[cId] = {
            status: att.status,
            score: att.score,
            percentage: att.percentage,
          };
        }
      });
    }

    const contests = contestsRaw.map((c) => {
      const computedState = getContestComputedState(c, now);
      const userAttempt = studentAttemptMap[c._id.toString()] || null;
      return {
        ...c,
        computedState,
        userAttempt,
      };
    });

    // Counts for tabs overview
    const baseCountQuery = isTeacherSelf
      ? { instructor: session.user.id }
      : {
          status: { $in: ['published', 'completed'] },
          ...(session?.user?.organizationId
            ? {
                $or: [
                  { organizationId: null },
                  { organizationId: session.user.organizationId },
                ],
              }
            : { visibility: { $in: ['public', 'unlisted'] } }),
        };

    const [liveCount, upcomingCount, completedCount] = await Promise.all([
      Contest.countDocuments({
        ...baseCountQuery,
        startTime: { $lte: now },
        endTime: { $gte: now },
        status: 'published',
      }),
      Contest.countDocuments({
        ...baseCountQuery,
        startTime: { $gt: now },
        status: 'published',
      }),
      Contest.countDocuments({
        ...baseCountQuery,
        $or: [{ endTime: { $lt: now } }, { status: 'completed' }],
      }),
    ]);

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

    if (!isTeacherSelf && !search) {
      await setCachedData(cacheKey, responseData, 60); // 60 seconds TTL
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

    // Strict Superadmin-controlled permission check
    const isAuthorized = await canTeacherManageContests(
      session.user.id,
      session.user.role
    );
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
      quizzes: rawQuizzes = [],
      questions: rawQuestions = [],
    } = validationResult.data;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ message: 'Invalid start or end date' }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { message: 'End time must be after start time' },
        { status: 400 }
      );
    }

    const solutionDate = solutionsReleaseAt
      ? new Date(solutionsReleaseAt)
      : endDate;

    const contestQuizRefs: Array<{
      quiz: mongoose.Types.ObjectId;
      title?: string;
      order: number;
      weight?: number;
    }> = [];

    let totalQuestions = 0;
    let totalPoints = 0;

    // Handle Direct Question Set (creates a standalone quiz linked to the contest)
    if (rawQuestions && rawQuestions.length > 0) {
      const standaloneQuiz = new Quiz({
        title: `${title} - Quiz`,
        description: description || 'Contest Question Set',
        course: new mongoose.Types.ObjectId(), // Standalone dummy ObjectId
        instructor: session.user.id,
        organizationId: session.user.organizationId || null,
        timeLimit: duration,
        isPublished: true,
        questionCount: rawQuestions.length,
        version: 1,
      });
      await standaloneQuiz.save();

      await setQuizQuestions(
        standaloneQuiz._id as mongoose.Types.ObjectId,
        rawQuestions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
        { bumpVersion: false }
      );

      contestQuizRefs.push({
        quiz: standaloneQuiz._id as mongoose.Types.ObjectId,
        title: title,
        order: 0,
        weight: 1,
      });

      totalQuestions += rawQuestions.length;
      totalPoints += rawQuestions.reduce((acc, q) => acc + (q.points || 1), 0);
    }

    // Handle Multiple Quizzes (if provided)
    if (rawQuizzes && rawQuizzes.length > 0) {
      for (let i = 0; i < rawQuizzes.length; i++) {
        const item = rawQuizzes[i];
        if (item.quizId) {
          const existingQuiz = await Quiz.findById(item.quizId).lean<{
            _id: mongoose.Types.ObjectId;
            title: string;
            questionCount?: number;
          }>();
          if (existingQuiz) {
            contestQuizRefs.push({
              quiz: existingQuiz._id,
              title: item.title || existingQuiz.title,
              order: item.order ?? contestQuizRefs.length,
              weight: 1,
            });
            totalQuestions += existingQuiz.questionCount || 0;
            totalPoints += existingQuiz.questionCount || 0;
          }
        } else if (item.questions && item.questions.length > 0) {
          const multiQuiz = new Quiz({
            title: item.title || `${title} - Round ${i + 1}`,
            description: `Contest Section ${i + 1}`,
            course: new mongoose.Types.ObjectId(),
            instructor: session.user.id,
            organizationId: session.user.organizationId || null,
            timeLimit: duration,
            isPublished: true,
            questionCount: item.questions.length,
            version: 1,
          });
          await multiQuiz.save();

          await setQuizQuestions(
            multiQuiz._id as mongoose.Types.ObjectId,
            item.questions.map((q) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
            })),
            { bumpVersion: false }
          );

          contestQuizRefs.push({
            quiz: multiQuiz._id as mongoose.Types.ObjectId,
            title: item.title || multiQuiz.title,
            order: item.order ?? contestQuizRefs.length,
            weight: 1,
          });

          totalQuestions += item.questions.length;
          totalPoints += item.questions.reduce((acc, q) => acc + (q.points || 1), 0);
        }
      }
    }

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
      questionCount: totalQuestions,
      totalPoints,
    });

    await contest.save();
    await invalidatePattern('contests:*');

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
