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
import { requireFeature } from '@/lib/settingsHelpers';
import { canManageOrgContent, type AccessUser } from '@/lib/accessControl';
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

    const contest = await Contest.findById(id).lean<IContest>();
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

    const isInstructor = canManageOrgContent(contest.organizationId, contest.instructor, authUser);

    if (!isInstructor && contest.organizationId && contest.visibility === 'organization') {
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
    if (isInstructor && studentIdParam && !mongoose.Types.ObjectId.isValid(studentIdParam)) {
      return NextResponse.json({ message: 'Invalid student ID' }, { status: 400 });
    }
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
          enableNegativeMarking: contest.enableNegativeMarking,
          negativeMarks: contest.negativeMarks,
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
