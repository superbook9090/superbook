// src/app/api/progress/route.ts — batched aggregates (no per-enrollment N+1)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { aggregateStudentProgress } from '@/domain/learning/progressAggregation';
import { logApiError, type LogContext } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/progress' };

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.user) logContext.userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('student');
    const courseId = searchParams.get('course');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    let targetStudentId = session.user.id;
    if (studentIdParam && (session.user.role === 'teacher' || session.user.role === 'admin')) {
      targetStudentId = studentIdParam;
    }

    await dbConnect();

    const { rows, overall } = await aggregateStudentProgress(targetStudentId, {
      courseId,
      skip,
      limit,
    });

    const EnrollmentModel = (await import('@/models/Enrollment')).default;
    const countFilter: Record<string, string> = { student: targetStudentId };
    if (courseId) countFilter.course = courseId;
    const total = await EnrollmentModel.countDocuments(countFilter);

    return NextResponse.json(
      {
        progress: rows,
        overallStats: overall,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120' },
      }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/progress', logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
