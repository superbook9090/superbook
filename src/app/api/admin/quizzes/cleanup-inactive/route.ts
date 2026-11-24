import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { isSuperAdmin } from '@/lib/roles';
import { logApiError, type LogContext } from '@/lib/logger';
import {
  INACTIVE_QUIZ_MIN_AGE_DAYS,
  findInactiveZeroAttemptQuizzes,
  cleanupInactiveZeroAttemptQuizzes,
} from '@/lib/quizzes/inactiveQuizCleanup';

export const maxDuration = 60;

// GET /api/admin/quizzes/cleanup-inactive — Dry-run preview (Superadmin only)
export async function GET() {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/admin/quizzes/cleanup-inactive',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Superadmin access required' },
        { status: 403 }
      );
    }

    logContext.userId = session.user.id;

    const { quizzes, cutoffDate } = await findInactiveZeroAttemptQuizzes();

    return NextResponse.json({
      success: true,
      minAgeDays: INACTIVE_QUIZ_MIN_AGE_DAYS,
      cutoffDate: cutoffDate.toISOString(),
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/admin/quizzes/cleanup-inactive', logContext);
    return NextResponse.json(
      { success: false, message: 'Failed to preview inactive quizzes' },
      { status: 500 }
    );
  }
}

// POST /api/admin/quizzes/cleanup-inactive — Delete eligible inactive quizzes silently (no email, Superadmin only)
export async function POST(req: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/admin/quizzes/cleanup-inactive',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Superadmin access required' },
        { status: 403 }
      );
    }

    logContext.userId = session.user.id;

    let body: { confirm?: boolean; quizIds?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request body. Explicit confirmation is required.' },
        { status: 400 }
      );
    }

    if (body.confirm !== true) {
      return NextResponse.json(
        { success: false, message: 'Explicit confirmation (confirm: true) is required before deleting quizzes.' },
        { status: 400 }
      );
    }

    let quizIds: string[] | undefined;
    if (body.quizIds !== undefined) {
      if (!Array.isArray(body.quizIds)) {
        return NextResponse.json(
          { success: false, message: 'quizIds must be an array of quiz IDs.' },
          { status: 400 }
        );
      }
      const invalidId = body.quizIds.find(
        (id) => typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidId !== undefined) {
        return NextResponse.json(
          { success: false, message: 'One or more provided quizIds are invalid.' },
          { status: 400 }
        );
      }
      quizIds = body.quizIds as string[];
    }

    const result = await cleanupInactiveZeroAttemptQuizzes({ quizIds });

    const summaryMessage =
      result.deletedCount === 0
        ? 'No eligible inactive quizzes were deleted.'
        : `Deleted ${result.deletedCount} inactive quiz(zes) with no emails sent.${
            result.skippedCount > 0 ? ` (${result.skippedCount} skipped)` : ''
          }`;

    return NextResponse.json({
      success: true,
      message: summaryMessage,
      ...result,
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/admin/quizzes/cleanup-inactive', logContext);
    return NextResponse.json(
      { success: false, message: 'Failed to clean up inactive quizzes' },
      { status: 500 }
    );
  }
}
