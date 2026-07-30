// src/app/api/certificates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Certificate from '@/models/Certificate';
import { serialize } from '@/lib/serialize';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';

// GET /api/certificates - List the logged-in student's certificates
export async function GET(request: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/certificates' };

  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course');

    const query: Record<string, unknown> = { student: session.user.id };
    if (courseId) query.course = courseId;

    const certificates = await Certificate.find(query)
      .sort({ issuedAt: -1 })
      .lean();

    return NextResponse.json({ certificates: serialize(certificates) });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/certificates', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
