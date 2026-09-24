import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';
import { getAdminStats } from '@/lib/analytics/adminStats';
import { getTeacherStats } from '@/lib/analytics/teacherStats';
import { getUserOverview } from '@/lib/analytics/userOverview';

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/analytics',
  };

  try {
    const featureCheck = await requireFeature('enableAnalytics');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const isAdmin = session.user?.role === 'admin';
    const isSuperAdmin = session.user?.role === 'superadmin';
    const isTeacher = session.user?.role === 'teacher';

    // Admin gets organization-specific analytics, superadmin gets system-wide
    if (type === 'admin' && (isAdmin || isSuperAdmin)) {
      const stats = await getAdminStats(session.user.organizationId, isSuperAdmin, startDate, endDate);
      return NextResponse.json({ stats }, { status: 200 });
    }

    // Teacher gets their course analytics
    if (type === 'teacher' && (isTeacher || isAdmin)) {
      const stats = await getTeacherStats(session.user.id);
      return NextResponse.json({ stats }, { status: 200 });
    }

    // Overview for current user
    const stats = await getUserOverview(session.user.id, session.user.role);
    return NextResponse.json(
      { stats },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/analytics', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
