import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logApiError, type LogContext } from '@/lib/logger';
import { resolveOrganizationInvite } from '@/lib/organizations/resolveInvite';

export async function POST(request: Request) {
  const logContext: LogContext = { method: 'POST', path: '/api/auth/add-organization' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { inviteCode } = await request.json();
    if (!inviteCode || typeof inviteCode !== 'string') {
      return NextResponse.json({ message: 'Invite code is required' }, { status: 400 });
    }

    await dbConnect();

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (currentUser.isSuspended) {
      return NextResponse.json({ message: 'Account suspended' }, { status: 403 });
    }

    if (currentUser.organizationId) {
      return NextResponse.json(
        { message: 'You are already a member of an organization' },
        { status: 400 }
      );
    }

    const joinRole = currentUser.role === 'teacher' ? 'teacher' : 'student';
    const resolved = await resolveOrganizationInvite(inviteCode, joinRole);
    if (!resolved.ok) {
      return NextResponse.json({ message: resolved.message }, { status: resolved.status });
    }

    currentUser.organizationId = resolved.data.organization._id;
    await currentUser.save();

    return NextResponse.json({
      message: 'Successfully joined the organization',
      organizationId: resolved.data.organization._id.toString(),
      organizationName: resolved.data.organization.name,
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/auth/add-organization', logContext);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
