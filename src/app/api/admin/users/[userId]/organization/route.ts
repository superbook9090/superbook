import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { logApiError, type LogContext } from '@/lib/logger';
import mongoose from 'mongoose';

// PATCH /api/admin/users/[userId]/organization - Assign/remove user from organization (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const logContext: LogContext = {
    method: 'PATCH',
    path: '/api/admin/users/[userId]/organization',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins and superadmins can assign users to organizations
    if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    logContext.userId = session.user.id;

    await dbConnect();
    const { userId } = await params;

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { organizationId } = body;

    // If organizationId is provided, validate it exists and is active
    if (organizationId) {
      if (!mongoose.Types.ObjectId.isValid(organizationId)) {
        return NextResponse.json(
          { message: 'Invalid organization ID' },
          { status: 400 }
        );
      }

      const organization = await Organization.findOne({
        _id: organizationId,
        isActive: true,
      });

      if (!organization) {
        return NextResponse.json(
          { message: 'Organization not found or inactive' },
          { status: 404 }
        );
      }

      // Admin can only assign users to their own organization
      if (session.user.role === 'admin') {
        if (!session.user.organizationId) {
          return NextResponse.json(
            { message: 'Admin must belong to an organization' },
            { status: 403 }
          );
        }
        if (session.user.organizationId.toString() !== organizationId) {
          return NextResponse.json(
            { message: 'Admin can only assign users to their own organization' },
            { status: 403 }
          );
        }
      }

      user.organizationId = organizationId;
    } else {
      // Remove user from organization
      user.organizationId = null;
    }

    await user.save();

    // Return updated user with organization populated
    const updatedUser = await User.findById(userId)
      .populate('organizationId', 'name code inviteCode')
      .lean();

    return NextResponse.json(updatedUser);
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/admin/users/[userId]/organization', logContext);
    return NextResponse.json(
      { message: 'Failed to update user organization' },
      { status: 500 }
    );
  }
}
