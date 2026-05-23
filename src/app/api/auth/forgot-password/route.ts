import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PasswordResetToken from '@/models/PasswordResetToken';
import { forgotPasswordSchema } from '@/lib/validation';
import { generateResetToken, getResetPasswordUrl } from '@/lib/passwordReset';
import { sendPasswordResetEmail } from '@/lib/email';
import { findUserByEmail } from '@/lib/user/findByEmail';
import { logApiError, type LogContext } from '@/lib/logger';
import {
  forgotPasswordEmailLimiter,
  forgotPasswordIpLimiter,
  getRequestIp,
  rateLimitExceededMessage,
} from '@/lib/rateLimiter';

const GENERIC_SUCCESS = {
  message:
    'If an account exists for that email, you will receive a password reset link shortly.',
};

export async function POST(req: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/auth/forgot-password' };

  try {
    const ip = getRequestIp(req);
    const ipLimit = forgotPasswordIpLimiter.check(ip);
    if (!ipLimit.allowed) {
      return NextResponse.json({ message: rateLimitExceededMessage() }, { status: 429 });
    }

    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid email address', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const email = validation.data.email.toLowerCase().trim();
    const emailLimit = forgotPasswordEmailLimiter.check(email);
    if (!emailLimit.allowed) {
      return NextResponse.json({ message: rateLimitExceededMessage() }, { status: 429 });
    }

    await dbConnect();

    const user = await findUserByEmail(email).select('_id name email password isSuspended');

    if (user && !user.isSuspended) {
      await PasswordResetToken.deleteMany({ userId: user._id });
      const { token, tokenHash, expiresAt } = generateResetToken();
      await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt,
      });

      try {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl: getResetPasswordUrl(token),
        });
      } catch (mailError) {
        await PasswordResetToken.deleteMany({ userId: user._id, tokenHash });
        logApiError(mailError as Error, 'POST', '/api/auth/forgot-password', logContext);
        return NextResponse.json(
          { message: 'Unable to send reset email. Please try again later.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(GENERIC_SUCCESS);
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/auth/forgot-password', logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
