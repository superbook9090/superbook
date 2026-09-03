import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Contest, { IContest } from '@/models/Contest';
import ContestAttempt, { IContestGradedAnswer } from '@/models/ContestAttempt';
import QuizQuestion from '@/models/QuizQuestion';
import { createContestAttemptSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { invalidatePattern } from '@/lib/redis';
import { listQuestionsForQuiz } from '@/domain/learning/quizContent';
import {
  getContestComputedState,
  computeContestTimeRemainingSeconds,
  areContestSolutionsReleased,
} from '@/lib/contest/contestHelpers';
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const [attemptsRaw, total, statsAgg] = await Promise.all([
      ContestAttempt.find({ contest: id })
        .populate('student', 'name email avatar phone')
        .sort({ score: -1, timeTaken: 1, submittedAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContestAttempt.countDocuments({ contest: id }),
      ContestAttempt.aggregate([
        { $match: { contest: new mongoose.Types.ObjectId(id), status: 'completed' } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            highestScore: { $max: '$score' },
            avgTimeTaken: { $avg: '$timeTaken' },
            totalCompleted: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = statsAgg[0] || {
      avgScore: 0,
      highestScore: 0,
      avgTimeTaken: 0,
      totalCompleted: 0,
    };

    return NextResponse.json(
      {
        attempts: serialize(attemptsRaw),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalParticipants: total,
          completedCount: stats.totalCompleted,
          avgScore: Math.round(stats.avgScore * 10) / 10,
          highestScore: stats.highestScore,
          avgTimeTaken: Math.round(stats.avgTimeTaken),
        },
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

    const now = new Date();
    const computedState = getContestComputedState(contest, now);

    const body = await request.json();
    const validationResult = createContestAttemptSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { action, answers: submittedAnswers = [], timeTaken, violationCount = 0 } =
      validationResult.data;

    // Helper: Collect all sanitized questions across connected quizzes
    const loadAllSanitizedQuestions = async () => {
      const allQuestions: Array<{
        _id: string;
        quizId: string;
        quizTitle?: string;
        order: number;
        question: string;
        options: string[];
        points: number;
      }> = [];

      for (const qRef of contest.quizzes || []) {
        const qId = qRef.quiz?._id || qRef.quiz;
        if (qId) {
          const rows = await listQuestionsForQuiz(qId as mongoose.Types.ObjectId);
          (rows as unknown as Array<{ _id: mongoose.Types.ObjectId; prompt: string; options: string[]; order: number; points?: number }>).forEach((q) => {
            allQuestions.push({
              _id: q._id.toString(),
              quizId: qId.toString(),
              quizTitle: qRef.title || 'Contest Section',
              order: q.order,
              question: q.prompt,
              options: q.options,
              points: q.points || 1,
            });
          });
        }
      }
      return allQuestions;
    };

    // -------------------------------------------------------------
    // ACTION: START / RESUME ATTEMPT
    // -------------------------------------------------------------
    if (action === 'start') {
      if (computedState === 'upcoming') {
        return NextResponse.json(
          { message: 'Contest has not started yet' },
          { status: 400 }
        );
      }
      if (computedState === 'completed') {
        return NextResponse.json(
          { message: 'Contest has already ended' },
          { status: 400 }
        );
      }

      // Check organization access
      if (contest.visibility === 'organization' && contest.organizationId) {
        if (contest.organizationId.toString() !== session.user.organizationId) {
          return NextResponse.json(
            { message: 'This contest is restricted to members of the organization' },
            { status: 403 }
          );
        }
      }

      // Check max participant limit
      if (contest.maxParticipants && contest.maxParticipants > 0) {
        const participantCount = (
          await ContestAttempt.distinct('student', { contest: contest._id })
        ).length;
        const studentHasAttempt = await ContestAttempt.exists({
          contest: contest._id,
          student: session.user.id,
        });
        if (!studentHasAttempt && participantCount >= contest.maxParticipants) {
          return NextResponse.json(
            { message: 'Contest participant limit has been reached' },
            { status: 403 }
          );
        }
      }

      // Check existing attempts
      const existingInProgress = await ContestAttempt.findOne({
        contest: contest._id,
        student: session.user.id,
        status: 'in_progress',
      });

      if (existingInProgress) {
        const remainingSeconds = computeContestTimeRemainingSeconds(
          existingInProgress.startedAt,
          contest.duration,
          contest.endTime,
          now
        );

        if (remainingSeconds > 0) {
          const questions = await loadAllSanitizedQuestions();
          return NextResponse.json({
            message: 'Resuming contest attempt',
            attempt: serialize(existingInProgress),
            questions,
            timeRemaining: remainingSeconds,
            duration: contest.duration,
            endTime: contest.endTime,
          });
        } else {
          // Time expired, mark timed_out
          existingInProgress.status = 'timed_out';
          existingInProgress.submittedAt = now;
          await existingInProgress.save();
        }
      }

      // Check attempt count
      const totalAttempts = await ContestAttempt.countDocuments({
        contest: contest._id,
        student: session.user.id,
      });

      if (totalAttempts >= (contest.maxAttempts || 1)) {
        return NextResponse.json(
          { message: 'You have reached the maximum allowed attempts for this contest' },
          { status: 400 }
        );
      }

      const questions = await loadAllSanitizedQuestions();
      const newAttempt = new ContestAttempt({
        student: session.user.id,
        contest: contest._id,
        answers: [],
        score: 0,
        percentage: 0,
        correctCount: 0,
        totalQuestions: questions.length,
        timeTaken: 0,
        startedAt: now,
        status: 'in_progress',
        attemptNumber: totalAttempts + 1,
        violationCount: 0,
      });

      await newAttempt.save();

      const timeRemaining = computeContestTimeRemainingSeconds(
        newAttempt.startedAt,
        contest.duration,
        contest.endTime,
        now
      );

      return NextResponse.json(
        {
          message: 'Contest attempt started',
          attempt: serialize(newAttempt),
          questions,
          timeRemaining,
          duration: contest.duration,
          endTime: contest.endTime,
        },
        { status: 201 }
      );
    }

    // -------------------------------------------------------------
    // ACTION: SUBMIT ATTEMPT
    // -------------------------------------------------------------
    if (action === 'submit') {
      const attempt = await ContestAttempt.findOne({
        contest: contest._id,
        student: session.user.id,
        status: 'in_progress',
      });

      if (!attempt) {
        // Fallback: check if the student already submitted or timed out
        const latestAttempt = await ContestAttempt.findOne({
          contest: contest._id,
          student: session.user.id,
        }).sort({ startedAt: -1 });

        if (latestAttempt && (latestAttempt.status === 'completed' || latestAttempt.status === 'timed_out')) {
          const solutionsReleased = areContestSolutionsReleased(contest, now);
          return NextResponse.json(
            {
              message: 'Contest attempt already submitted',
              result: {
                attemptId: latestAttempt._id.toString(),
                score: latestAttempt.score,
                percentage: latestAttempt.percentage,
                correctCount: latestAttempt.correctCount,
                totalQuestions: latestAttempt.totalQuestions,
                timeTaken: latestAttempt.timeTaken,
                submittedAt: latestAttempt.submittedAt,
                solutionsReleaseAt: contest.solutionsReleaseAt || contest.endTime,
                areSolutionsReleased: solutionsReleased,
              },
            },
            { status: 200 }
          );
        }

        return NextResponse.json(
          { message: 'No active in-progress contest attempt found' },
          { status: 404 }
        );
      }

      // Calculate server time taken with 30-second network buffer
      const elapsedSeconds = Math.max(
        1,
        Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
      );
      const maxAllowedSeconds = contest.duration * 60 + 30; // 30s buffer
      const finalTimeTaken = Math.min(elapsedSeconds, maxAllowedSeconds);

      // Load all questions with correctOption to grade
      const quizIds = (contest.quizzes || [])
        .map((qRef) => (typeof qRef.quiz === 'object' && qRef.quiz !== null ? qRef.quiz._id : qRef.quiz))
        .filter((q) => Boolean(q) && mongoose.Types.ObjectId.isValid(String(q)));

      const submittedQuestionIds = submittedAnswers
        .map((a) => a.questionId)
        .filter((qId) => Boolean(qId) && mongoose.Types.ObjectId.isValid(String(qId)));

      const rawQuestionDocs = await QuizQuestion.find({
        $or: [
          ...(quizIds.length > 0 ? [{ quiz: { $in: quizIds } }] : []),
          ...(submittedQuestionIds.length > 0 ? [{ _id: { $in: submittedQuestionIds } }] : []),
        ],
      }).lean();

      const questionDocs = rawQuestionDocs as unknown as Array<{
        _id: mongoose.Types.ObjectId;
        quiz?: mongoose.Types.ObjectId;
        order?: number;
        prompt: string;
        options: string[];
        correctOption: number;
        points?: number;
      }>;

      const questionMap = new Map(questionDocs.map((q) => [q._id.toString(), q]));

      let totalPointsAwarded = 0;
      let correctCount = 0;
      let totalPossiblePoints = 0;

      questionDocs.forEach((q) => {
        totalPossiblePoints += q.points || 1;
      });

      const gradedAnswers: IContestGradedAnswer[] = [];

      submittedAnswers.forEach((ans) => {
        const qDoc = questionMap.get(ans.questionId);
        if (qDoc) {
          const isCorrect = ans.selectedOption === qDoc.correctOption;
          const pointsEarned = isCorrect ? (qDoc.points || 1) : 0;
          if (isCorrect) correctCount++;
          totalPointsAwarded += pointsEarned;

          gradedAnswers.push({
            quizId: (qDoc.quiz && mongoose.Types.ObjectId.isValid(String(qDoc.quiz))
              ? new mongoose.Types.ObjectId(String(qDoc.quiz))
              : undefined),
            question: new mongoose.Types.ObjectId(String(qDoc._id)),
            order: typeof qDoc.order === 'number' ? qDoc.order : 0,
            selectedOption: typeof ans.selectedOption === 'number' ? ans.selectedOption : -1,
            isCorrect,
            points: pointsEarned,
          });
        }
      });

      const percentage = totalPossiblePoints > 0
        ? Math.round((totalPointsAwarded / totalPossiblePoints) * 1000) / 10
        : 0;

      attempt.answers = gradedAnswers;
      attempt.score = totalPointsAwarded;
      attempt.percentage = percentage;
      attempt.correctCount = correctCount;
      attempt.totalQuestions = questionDocs.length > 0 ? questionDocs.length : (submittedAnswers.length || 1);
      attempt.timeTaken = timeTaken !== undefined && timeTaken !== null ? timeTaken : finalTimeTaken;
      attempt.status = 'completed';
      attempt.submittedAt = now;
      attempt.violationCount = violationCount;

      await attempt.save();

      // Invalidate leaderboard & contest cache
      await invalidatePattern(`contests:*`);

      const solutionsReleased = areContestSolutionsReleased(contest, now);

      // Return submission confirmation without answers if solutions are locked!
      return NextResponse.json(
        {
          message: 'Contest attempt submitted successfully',
          result: {
            attemptId: attempt._id.toString(),
            score: totalPointsAwarded,
            percentage,
            correctCount,
            totalQuestions: attempt.totalQuestions,
            timeTaken: attempt.timeTaken,
            submittedAt: attempt.submittedAt,
            solutionsReleaseAt: contest.solutionsReleaseAt || contest.endTime,
            areSolutionsReleased: solutionsReleased,
          },
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
