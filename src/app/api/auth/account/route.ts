import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logApiError, type LogContext } from '@/lib/logger';

/** Returns account flags for profile UI (password change eligibility). */
export async function GET() {
  const logContext: LogContext = { method: 'GET', path: '/api/auth/account' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select('password provider');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      provider: user.provider ?? 'credentials',
      hasPassword: Boolean(user.password),
      canChangePassword: Boolean(user.password),
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/auth/account', logContext);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
