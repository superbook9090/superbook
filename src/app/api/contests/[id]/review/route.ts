import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Contest, { IContest } from '@/models/Contest';
import ContestAttempt, { IContestAttempt } from '@/models/ContestAttempt';
import QuizQuestion from '@/models/QuizQuestion';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { areContestSolutionsReleased } from '@/lib/contest/contestHelpers';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// GET /api/contests/[id]/review - View solutions & review (Guarded until solutionsReleaseAt)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'GET', path: `/api/contests/${id}/review` };

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

    const now = new Date();
    const solutionsReleased = areContestSolutionsReleased(contest, now);

    // If student requests before solutionsReleaseAt, lock review
    if (!isInstructor && !solutionsReleased) {
      return NextResponse.json(
        {
          isLocked: true,
          message: 'Solutions and answer review are locked until the scheduled release time.',
          solutionsReleaseAt: contest.solutionsReleaseAt || contest.endTime,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('studentId');
    const targetStudentId = isInstructor && studentIdParam ? studentIdParam : session.user.id;

    const attempt = await ContestAttempt.findOne({
      contest: id,
      student: targetStudentId,
      status: { $in: ['completed', 'force_submitted', 'timed_out'] },
    })
      .sort({ score: -1, startedAt: -1 })
      .populate('student', 'name email avatar')
      .lean<IContestAttempt>();

    if (!attempt) {
      return NextResponse.json(
        { message: 'No completed attempt found for review' },
        { status: 404 }
      );
    }

    // Load question details for all quiz questions
    const quizIds = (contest.quizzes || []).map((qRef) => qRef.quiz?._id || qRef.quiz);
    const rawQuestions = await QuizQuestion.find({
      quiz: { $in: quizIds },
    })
      .sort({ order: 1 })
      .lean();

    const questions = rawQuestions as unknown as Array<{
      _id: mongoose.Types.ObjectId;
      prompt: string;
      options: string[];
      correctOption: number;
      points?: number;
    }>;

    const answerMap = new Map(
      (attempt.answers || []).map((a) => [a.question.toString(), a])
    );

    const questionReviews = questions.map((q) => {
      const studentAnswer = answerMap.get(q._id.toString());
      return {
        questionId: q._id.toString(),
        prompt: q.prompt,
        options: q.options,
        correctOption: q.correctOption,
        points: q.points || 1,
        selectedOption: studentAnswer ? studentAnswer.selectedOption : -1,
        isCorrect: studentAnswer ? studentAnswer.isCorrect : false,
        pointsEarned: studentAnswer ? studentAnswer.points : 0,
      };
    });

    return NextResponse.json(
      {
        isLocked: false,
        attempt: serialize(attempt),
        contest: {
          _id: contest._id.toString(),
          title: contest.title,
          description: contest.description,
          solutionsReleaseAt: contest.solutionsReleaseAt,
        },
        questionReviews,
      },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', `/api/contests/${id}/review`, logContext);
    return NextResponse.json(
      { message: 'Failed to load contest solutions review' },
      { status: 500 }
    );
  }
}
