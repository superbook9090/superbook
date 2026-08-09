import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logApiError, type LogContext } from '@/lib/logger';
import { canUserCreatePublicCourses } from '@/lib/settingsHelpers';

/** Returns account flags for profile and course-form UI (password change, public course permission). */
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
      canCreatePublicCourses: await canUserCreatePublicCourses(
        session.user.id,
        session.user.role
      ),
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/auth/account', logContext);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const logContext: LogContext = { method: 'PATCH', path: '/api/auth/account' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name: name.trim() },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Name updated successfully',
      name: user.name,
    });
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/auth/account', logContext);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
