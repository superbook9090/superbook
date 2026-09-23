import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';
import { checkAndDeclareResults } from '@/lib/contests/declareResults';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const logContext = { method: 'GET', path: '/api/cron/declare-results' };

  try {
    // 1. Verify Vercel Cron Secret (if configured)
    const authHeader = req.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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
