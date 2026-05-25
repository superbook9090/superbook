// src/app/api/enrollments/join-by-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { joinCourseByCodeSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { enrollStudentByCourseCode } from '@/lib/enrollmentService';
import {
  courseCodeAttemptLimiter,
  getRequestIp,
  rateLimitExceededMessage,
} from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/enrollments/join-by-code',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'student') {
      return NextResponse.json(
        { message: 'Only students can enroll in courses' },
        { status: 403 }
      );
    }

    logContext.userId = session.user.id;

    const ip = getRequestIp(request);
    const limitKey = `course-code:${session.user.id}:${ip}`;
    const rateCheck = courseCodeAttemptLimiter.check(limitKey);
    if (!rateCheck.allowed) {
      return NextResponse.json({ message: rateLimitExceededMessage() }, { status: 429 });
    }

    await dbConnect();

    const body = await request.json();
    const validationResult = joinCourseByCodeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const result = await enrollStudentByCourseCode({
      studentId: session.user.id,
      organizationId: user.organizationId ?? null,
      courseCode: validationResult.data.courseCode,
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }

    return NextResponse.json(
      { message: 'Enrolled successfully', enrollment: result.enrollment },
      { status: 201 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/enrollments/join-by-code', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
