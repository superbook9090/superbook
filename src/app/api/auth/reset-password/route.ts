import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import { resetPasswordSchema } from '@/lib/validation';
import { hashResetToken } from '@/lib/passwordReset';
import { logApiError, type LogContext } from '@/lib/logger';
import { getRequestIp, rateLimitExceededMessage, resetPasswordIpLimiter } from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/auth/reset-password' };

  try {
    const ip = getRequestIp(req);
    const ipLimit = resetPasswordIpLimiter.check(ip);
    if (!ipLimit.allowed) {
      return NextResponse.json({ message: rateLimitExceededMessage() }, { status: 429 });
    }

    const body = await req.json();
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;
    const tokenHash = hashResetToken(token);

    await dbConnect();

    const resetRecord = await PasswordResetToken.findOne({ tokenHash });
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      if (resetRecord) {
        await PasswordResetToken.deleteOne({ _id: resetRecord._id });
      }
      return NextResponse.json(
        { message: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const user = await User.findById(resetRecord.userId).select('+password isSuspended');
    if (!user || user.isSuspended) {
      await PasswordResetToken.deleteOne({ _id: resetRecord._id });
      return NextResponse.json(
        { message: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    user.password = password;
    if (!user.provider) {
      user.provider = 'credentials';
    }
    await user.save();
    await PasswordResetToken.deleteMany({ userId: user._id });

    return NextResponse.json({ message: 'Password updated successfully. You can sign in now.' });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/auth/reset-password', logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
