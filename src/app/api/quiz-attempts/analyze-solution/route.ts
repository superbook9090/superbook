import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import QuizQuestion from '@/models/QuizQuestion';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonApiError, jsonSuccess } from '@/lib/server/api-response';
import { solutionAnalysisRateLimiter, getRequestIp } from '@/lib/rateLimiter';
import { requireFeature } from '@/lib/settingsHelpers';
import {
  buildSolutionAnalysisPrompt,
  fetchStockanlyzerChat,
} from '@/lib/stockanlyzer/chat';
import type { Types } from 'mongoose';

const analyzeSolutionSchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/quiz-attempts/analyze-solution' };

  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }

    logContext.userId = session.user.id;

    const featureCheck = await requireFeature('enableQuizSolutionAnalysis');
    if (featureCheck) return featureCheck;

    const rateLimitKey = `${session.user.id}:${getRequestIp(req)}`;
    const rateLimitCheck = solutionAnalysisRateLimiter.check(rateLimitKey);
    if (!rateLimitCheck.allowed) {
      return jsonApiError(
        'RATE_LIMIT',
        'Too many analysis requests. Please wait a moment and try again.',
        429
      );
    }

    const body = await req.json();
    const parsed = analyzeSolutionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonApiError('VALIDATION', 'Invalid request payload', 400);
    }

    const { attemptId, questionId } = parsed.data;

    const attempt = await QuizAttempt.findById(attemptId)
      .select('student quiz status answers')
      .lean();

    if (!attempt) {
      return jsonApiError('NOT_FOUND', 'Attempt not found', 404);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const att = attempt as any as {
      student: Types.ObjectId;
      quiz: Types.ObjectId;
      status: string;
      answers?: { question: Types.ObjectId; selectedOption: number }[];
    };

    if (att.student.toString() !== session.user.id) {
      return jsonApiError('FORBIDDEN', 'Unauthorized', 403);
    }

    if (att.status !== 'completed' && att.status !== 'force_submitted') {
      return jsonApiError('INVALID_STATE', 'Quiz must be completed before analyzing solutions', 400);
    }

    const questionDoc = await QuizQuestion.findOne({
      _id: questionId,
      quiz: att.quiz,
    })
      .select('prompt options correctOption')
      .lean();

    if (!questionDoc) {
      return jsonApiError('NOT_FOUND', 'Question not found', 404);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const question = questionDoc as any as {
      prompt: string;
      options: string[];
      correctOption: number;
    };

    const storedAnswer = (att.answers ?? []).find((a) => a.question.toString() === questionId);
    const selectedOption = storedAnswer?.selectedOption ?? -1;

    const prompt = buildSolutionAnalysisPrompt({
      question: question.prompt,
      options: question.options ?? [],
      correctAnswer: question.correctOption,
      selectedOption,
    });

    const analysis = await fetchStockanlyzerChat(prompt);

    return jsonSuccess({ analysis });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/quiz-attempts/analyze-solution', logContext);
    return jsonApiError(
      'INTERNAL',
      'Failed to analyze the solution. Please try again later.',
      500
    );
  }
}
