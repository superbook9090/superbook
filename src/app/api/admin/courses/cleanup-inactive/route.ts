import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { isSuperAdmin } from '@/lib/roles';
import { logApiError, type LogContext } from '@/lib/logger';
import {
  INACTIVE_COURSE_MIN_AGE_DAYS,
  INACTIVE_COURSE_REMOVAL_EMAIL_MESSAGE,
  findInactiveZeroEnrollmentCourses,
  cleanupInactiveZeroEnrollmentCourses,
} from '@/lib/courses/inactiveCourseCleanup';

export const maxDuration = 60;

// GET /api/admin/courses/cleanup-inactive — Dry-run preview (Superadmin only)
export async function GET() {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/admin/courses/cleanup-inactive',
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

    const { courses, cutoffDate } = await findInactiveZeroEnrollmentCourses();

    const uniqueEmails = new Set(
      courses
        .map((c) => c.instructor?.email?.trim().toLowerCase())
        .filter((e): e is string => Boolean(e))
    );

    return NextResponse.json({
      success: true,
      minAgeDays: INACTIVE_COURSE_MIN_AGE_DAYS,
      cutoffDate: cutoffDate.toISOString(),
      emailMessage: INACTIVE_COURSE_REMOVAL_EMAIL_MESSAGE,
      count: courses.length,
      uniqueInstructorsCount: uniqueEmails.size,
      courses,
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/admin/courses/cleanup-inactive', logContext);
    return NextResponse.json(
      { success: false, message: 'Failed to preview inactive courses' },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses/cleanup-inactive — Delete eligible inactive courses & notify instructors (Superadmin only)
export async function POST(req: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/admin/courses/cleanup-inactive',
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

    let body: { confirm?: boolean; courseIds?: unknown } = {};
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
        { success: false, message: 'Explicit confirmation (confirm: true) is required before deleting courses.' },
        { status: 400 }
      );
    }

    let courseIds: string[] | undefined;
    if (body.courseIds !== undefined) {
      if (!Array.isArray(body.courseIds)) {
        return NextResponse.json(
          { success: false, message: 'courseIds must be an array of course IDs.' },
          { status: 400 }
        );
      }
      const invalidId = body.courseIds.find(
        (id) => typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidId !== undefined) {
        return NextResponse.json(
          { success: false, message: 'One or more provided courseIds are invalid.' },
          { status: 400 }
        );
      }
      courseIds = body.courseIds as string[];
    }

    const result = await cleanupInactiveZeroEnrollmentCourses({
      deletedBy: session.user.name || session.user.email || 'Superadmin',
      courseIds,
    });

    const summaryMessage =
      result.deletedCount === 0
        ? 'No eligible inactive courses were deleted.'
        : `Deleted ${result.deletedCount} inactive course(s) and sent ${result.emailsSent} notification email(s).${
            result.emailsFailed > 0 ? ` (${result.emailsFailed} email(s) failed)` : ''
          }${result.skippedCount > 0 ? ` (${result.skippedCount} skipped)` : ''}`;

    return NextResponse.json({
      success: true,
      message: summaryMessage,
      ...result,
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/admin/courses/cleanup-inactive', logContext);
    return NextResponse.json(
      { success: false, message: 'Failed to clean up inactive courses' },
      { status: 500 }
    );
  }
}
