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
    const user = await User.findById(session.user.id).select('password provider organizationId canCreateContests');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let organizationName = null;
    if (user.organizationId) {
      const Organization = (await import('@/models/Organization')).default;
      const org = await Organization.findById(user.organizationId).select('name');
      if (org) {
        organizationName = org.name;
      }
    }

    return NextResponse.json({
      provider: user.provider ?? 'credentials',
      hasPassword: Boolean(user.password),
      canChangePassword: user.provider !== 'google' || Boolean(user.password),
      canCreatePublicCourses: await canUserCreatePublicCourses(
        session.user.id,
        session.user.role
      ),
      canCreateContests: Boolean(user.canCreateContests || session.user.role === 'superadmin'),
      organizationName,
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

    const { name, email } = await request.json();
    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, string> = {};

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ message: 'Name is required' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      if (!email || typeof email !== 'string' || !email.trim()) {
        return NextResponse.json({ message: 'Email is required' }, { status: 400 });
      }
      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
      }

      // Check if user has a mock phone registration email
      const isMockEmail = user.email?.endsWith('@phone.quizdo.com');
      if (!isMockEmail) {
        return NextResponse.json({
          message: 'Email can only be added for phone accounts without a linked email.'
        }, { status: 403 });
      }

      const existingUser = await User.findOne({ email: trimmedEmail });
      if (existingUser) {
        return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
      }
      updateData.email = trimmedEmail;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Account updated successfully',
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/auth/account', logContext);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
