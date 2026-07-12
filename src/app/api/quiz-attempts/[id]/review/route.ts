// GET /api/quiz-attempts/[id]/review — completed attempts only; joins QuizQuestion for keys + correct options
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import QuizQuestion from '@/models/QuizQuestion';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { buildQuizComparison } from '@/lib/quiz/quizComparison';
import { safeNumber, DEFAULT_TIME_LIMIT_MINUTES } from '@/lib/quiz/resultDefaults';
import type { Types } from 'mongoose';
import { requireFeature } from '@/lib/settingsHelpers';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'GET', path: `/api/quiz-attempts/${id}/review` };

  try {
    const featureCheck = await requireFeature('enableQuizzes');
    if (featureCheck) return featureCheck;

    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.user) logContext.userId = session.user.id;

    const attempt = await QuizAttempt.findById(id)
      .populate('quiz', 'title description timeLimit questionCount version')
      .populate('course', 'title description')
      .populate('student', 'name email')
      .lean();

    if (!attempt) {
      return NextResponse.json({ message: 'Attempt not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const att = attempt as any;

    const studentId =
      typeof att.student === 'object' && att.student && '_id' in att.student
        ? att.student._id.toString()
        : String(att.student);
    if (studentId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (att.status !== 'completed' && att.status !== 'force_submitted') {
      return NextResponse.json({ message: 'Quiz must be completed before reviewing' }, { status: 400 });
    }

    const quizId =
      typeof att.quiz === 'object' && att.quiz && '_id' in att.quiz ? att.quiz._id : att.quiz;

    const qDocs = await QuizQuestion.find({ quiz: quizId }).sort({ order: 1 }).lean();
    const quizMetaRaw = await Quiz.findById(quizId).select('title description timeLimit').lean();
    const quizMeta = quizMetaRaw as { _id: Types.ObjectId; title: string; description: string; timeLimit: number } | null;

    if (!quizMeta) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const peerAttempts = await QuizAttempt.find({
      quiz: quizId,
      status: { $in: ['completed', 'force_submitted'] },
      attemptNumber: 1,
    })
      .select('score correctCount totalQuestions timeTaken answers')
      .lean();

    const comparison = buildQuizComparison(
      {
        score: safeNumber(att.score),
        correctCount: safeNumber(att.correctCount),
        totalQuestions: safeNumber(att.totalQuestions, qDocs.length),
        timeTaken: safeNumber(att.timeTaken),
        answers: (att.answers ?? []) as StoredAnswer[],
      },
      peerAttempts as unknown as StoredAttempt[],
      qDocs as { _id: Types.ObjectId; points?: number }[],
      safeNumber(quizMeta.timeLimit, DEFAULT_TIME_LIMIT_MINUTES)
    );

    const questions = qDocs.map((q) => {
      const row = q as unknown as {
        _id: Types.ObjectId;
        order: number;
        prompt: string;
        options: string[];
        correctOption: number;
      };
      return {
        _id: row._id.toString(),
        order: row.order,
        question: row.prompt,
        options: row.options,
        correctAnswer: row.correctOption,
      };
    });

    const answers = (att.answers as { question: Types.ObjectId; order: number; selectedOption: number; isCorrect: boolean }[]).map(
      (a) => ({
        questionId: a.question.toString(),
        order: a.order,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect,
      })
    );

    const reviewData = {
      attempt: {
        _id: att._id,
        score: safeNumber(att.score),
        correctCount: safeNumber(att.correctCount),
        totalQuestions: safeNumber(att.totalQuestions, questions.length),
        timeTaken: safeNumber(att.timeTaken),
        attemptNumber: Math.max(1, safeNumber(att.attemptNumber, 1)),
        submittedAt: att.submittedAt ?? null,
      },
      quiz: {
        _id: quizMeta._id,
        title: quizMeta.title ?? '',
        description: quizMeta.description ?? '',
        timeLimit: safeNumber(quizMeta.timeLimit, DEFAULT_TIME_LIMIT_MINUTES),
        questions,
      },
      answers,
      comparison,
    };

    return NextResponse.json(serialize(reviewData), { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'GET', `/api/quiz-attempts/${id}/review`, logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}

type StoredAnswer = {
  question: Types.ObjectId;
  selectedOption: number;
  isCorrect: boolean;
};

type StoredAttempt = {
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  answers: StoredAnswer[];
};
