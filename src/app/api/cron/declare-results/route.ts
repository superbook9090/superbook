import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logApiError } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';
import { checkAndDeclareResults } from '@/lib/contests/declareResults';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isValidCronBearer(authHeader: string | null, expectedSecret: string | undefined): boolean {
  if (!expectedSecret || !authHeader) return false;
  const expected = `Bearer ${expectedSecret}`;
  const a = Buffer.from(authHeader, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const logContext = { method: 'GET', path: '/api/cron/declare-results' };

  try {
    // 1. Verify Vercel Cron Secret (Bearer only, fail closed) or Superadmin session
    const authHeader = req.headers.get('authorization');
    const isCronAuthorized = isValidCronBearer(authHeader, process.env.CRON_SECRET);

    let isSuperAdmin = false;
    if (!isCronAuthorized) {
      const session = await getServerSession(authOptions);
      if (session?.user?.role === 'superadmin') {
        isSuperAdmin = true;
      }
    }

    if (!isCronAuthorized && !isSuperAdmin) {
      return NextResponse.json({ message: 'Unauthorized. Superadmin session or valid CRON_SECRET is required.' }, { status: 401 });
    }
    
    // 1b. Verify feature toggle
    const featureCheck = await requireFeature('enableAutoDeclareResults');
    if (featureCheck) return featureCheck;

    // 2. Execute result declaration logic
    const { processed, notificationsSent } = await checkAndDeclareResults();

    return NextResponse.json({
      message: processed > 0 ? 'Successfully processed contests' : 'No new contests to declare',
      processed,
      notificationsSent,
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/cron/declare-results', logContext);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
