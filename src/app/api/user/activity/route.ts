// src/app/api/user/activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { userActivitySchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { isMobileAppUserAgent } from '@/lib/mobile/mobileDetection';

export async function POST(request: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/user/activity',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    logContext.userId = session.user.id;

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty on beacon/ping
      body = {};
    }

    const validation = userActivitySchema.safeParse(body);
    const userAgent = request.headers.get('user-agent') || '';

    let platform: 'android' | 'ios' | 'web' = 'web';
    if (validation.success && validation.data.platform) {
      platform = validation.data.platform;
    } else if (isMobileAppUserAgent(userAgent)) {
      platform = /android/i.test(userAgent) ? 'android' : /iphone|ipad|ipod/i.test(userAgent) ? 'ios' : 'android';
    }

    await dbConnect();

    await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          lastActiveAt: new Date(),
          lastPlatform: platform,
          ...(userAgent ? { lastUserAgent: userAgent.slice(0, 300) } : {}),
        },
      },
      { timestamps: false }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'POST', logContext.path || '/api/user/activity', logContext);
    return NextResponse.json(
      { message: 'Failed to record activity' },
      { status: 500 }
    );
  }
}
