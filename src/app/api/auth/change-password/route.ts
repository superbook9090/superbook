import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { changePasswordSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { changePasswordLimiter, getRequestIp, rateLimitExceededMessage } from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/auth/change-password' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const limitKey = `user:${session.user.id}`;
    const userLimit = changePasswordLimiter.check(limitKey);
    if (!userLimit.allowed) {
      return NextResponse.json({ message: rateLimitExceededMessage() }, { status: 429 });
    }

    // Fallback cap by IP for authenticated route (shared networks)
    const ipLimit = changePasswordLimiter.check(`ip:${getRequestIp(req)}`);
    if (!ipLimit.allowed) {
      return NextResponse.json({ message: rateLimitExceededMessage() }, { status: 429 });
    }

    const body = await req.json();
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    await dbConnect();
    const user = await User.findById(session.user.id).select('+password provider isSuspended');

    if (!user || user.isSuspended) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json(
        {
          message:
            'No password is set for this account. Use Forgot Password on the login page to set one via email.',
        },
        { status: 400 }
      );
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully.' });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/auth/change-password', logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
