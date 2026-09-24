import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { validateObjectId } from '@/lib/sanitize';
import { logApiError, type LogContext } from '@/lib/logger';
import { deleteUserRelatedData } from '@/lib/cascade/deleteRelated';
import { checkAdmin } from '@/lib/admin/adminAuth';
import { buildAdminUsersQuery, fetchAdminUsersWithStats } from '@/lib/admin/userQuery';
import { validateUserUpdate, validateUserDeletion } from '@/lib/admin/userMutations';

// GET /api/admin/users - Get all users (Admin only)
export async function GET(request: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/admin/users' };

  try {
    const session = await getServerSession(authOptions);
    const authResult = checkAdmin(session);

    if (!authResult.authorized) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (session?.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const platform = searchParams.get('platform');
    const activity = searchParams.get('activity');
    const organizationIdParam = searchParams.get('organizationId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const { query, orgFilter } = buildAdminUsersQuery(authResult, {
      role,
      search,
      platform,
      activity,
      organizationIdParam,
    });

    const { users, total, stats } = await fetchAdminUsersWithStats(query, orgFilter, page, limit);

    return NextResponse.json(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/admin/users', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Update user (Admin only)
export async function PATCH(request: NextRequest) {
  const logContext: LogContext = { method: 'PATCH', path: '/api/admin/users' };

  try {
    const session = await getServerSession(authOptions);
    const authResult = checkAdmin(session);

    if (!authResult.authorized) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    if (session?.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const { userId, updates } = await request.json();

    if (!userId || !updates) {
      return NextResponse.json({ message: 'User ID and updates are required' }, { status: 400 });
    }

    if (!validateObjectId(userId)) {
      return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }

    const targetUser = await User.findById(userId).select('-password').lean<{
      _id: unknown;
      role: string;
      organizationId?: unknown;
    }>();

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const validation = validateUserUpdate(targetUser, updates, session?.user?.id || '', authResult);
    if (validation.error) {
      return NextResponse.json({ message: validation.error }, { status: validation.status || 400 });
    }

    if (updates.role && updates.role !== targetUser.role) {
      await deleteUserRelatedData(userId);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated', user }, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/admin/users', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete user (Admin only)
export async function DELETE(request: NextRequest) {
  const logContext: LogContext = { method: 'DELETE', path: '/api/admin/users' };

  try {
    const session = await getServerSession(authOptions);
    const authResult = checkAdmin(session);

    if (!authResult.authorized) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    if (session?.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    if (!validateObjectId(userId)) {
      return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }

    const targetUser = await User.findById(userId).select('-password').lean<{
      _id: unknown;
      role: string;
      organizationId?: unknown;
    }>();

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const validation = validateUserDeletion(targetUser, session?.user?.id || '', authResult);
    if (validation.error) {
      return NextResponse.json({ message: validation.error }, { status: validation.status || 400 });
    }

    await deleteUserRelatedData(userId);
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/admin/users', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
