import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isStaffRole } from '@/lib/roles';
import { requireFeature } from '@/lib/settingsHelpers';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logApiError, logError } from '@/lib/logger';
import z from 'zod';
import { buildAiQuizPrompt } from '@/lib/ai/quizPrompt';
import { generateQuestionsWithFallback } from '@/lib/ai/quizGenerator';
import {
  validateTeacherAiPermissionsAndQuota,
  fetchTeacherAiQuotaStatus,
} from '@/lib/ai/quotaCheck';

const generateAiQuizSchema = z.object({
  topic: z.string().min(2, 'Topic is required').max(300, 'Topic is too long'),
  numQuestions: z
    .number()
    .int()
    .min(1, 'At least 1 question is required')
    .max(50, 'Maximum 50 questions can be generated at a time')
    .default(5),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  language: z.string().optional().default('English'),
  instructions: z.string().max(500, 'Instructions too long').optional(),
  model: z.string().optional(),
  autoSwitchOnLimit: z.boolean().optional().default(true),
  entityType: z.enum(['quiz', 'contest']).optional().default('quiz'),
});

export async function POST(req: NextRequest) {
  const logContext = { path: '/api/quizzes/generate-ai' };
  try {
    const featureCheck = await requireFeature('enableAiQuizGen');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (!isStaffRole(userRole)) {
      return NextResponse.json(
        { message: 'Forbidden. Only teachers and staff can generate AI questions.' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const parseResult = generateAiQuizSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: 'Invalid input parameters', errors: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { topic, numQuestions, difficulty, language, instructions, model, entityType } =
      parseResult.data;

    await dbConnect();
    const quotaResult = await validateTeacherAiPermissionsAndQuota(
      userId,
      userRole,
      entityType,
      numQuestions
    );

    if (quotaResult.error) {
      return NextResponse.json(
        {
          message: quotaResult.error,
          ...(quotaResult.currentCount !== undefined && quotaResult.effectiveLimit !== undefined
            ? {
                usage: {
                  used: quotaResult.currentCount,
                  limit: quotaResult.effectiveLimit,
                  remaining: 0,
                },
              }
            : {}),
        },
        { status: quotaResult.status || 400 }
      );
    }

    const prompt = buildAiQuizPrompt({
      topic,
      numQuestions,
      difficulty,
      language,
      instructions,
      entityType,
    });

    const { questions, modelUsed, switchedModel, lastErrorMessage } =
      await generateQuestionsWithFallback(prompt, numQuestions, model);

    if (!questions || questions.length === 0) {
      logError('[AI_QUIZ_GEN] All AI generation attempts failed', logContext, {
        lastErrorMessage,
        entityType,
      });
      return NextResponse.json(
        {
          message:
            entityType === 'contest'
              ? 'Unable to generate contest questions at this moment. The AI service is currently busy or unavailable. Please try again in a few moments.'
              : 'Unable to generate quiz at this moment. The AI service is currently busy or unavailable. Please try again in a few moments.',
        },
        { status: 503 }
      );
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { aiQuizGenerationsCount: 1 },
    });

    const currentCount = (quotaResult.currentCount ?? 0) + 1;
    const effectiveLimit = quotaResult.effectiveLimit ?? 5;
    const remaining = Math.max(0, effectiveLimit - currentCount);

    return NextResponse.json({
      success: true,
      questions,
      modelUsed,
      switchedModel,
      usage: {
        used: currentCount,
        limit: effectiveLimit,
        remaining,
      },
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/quizzes/generate-ai', logContext);
    return NextResponse.json(
      { message: 'Failed to generate questions. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const logContext = { path: '/api/quizzes/generate-ai', method: 'GET' };
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    if (!isStaffRole(userRole)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const status = await fetchTeacherAiQuotaStatus(userId, userRole);
    if (!status) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/quizzes/generate-ai', logContext);
    return NextResponse.json({ message: 'Failed to fetch AI quiz limits' }, { status: 500 });
  }
}
