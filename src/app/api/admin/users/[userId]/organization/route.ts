import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { logApiError, type LogContext } from '@/lib/logger';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
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
    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    logContext.userId = session.user.id;
    const callerIsSuper = isSuperAdmin(session.user.role);

    if (!callerIsSuper && (!session.user.organizationId || !mongoose.Types.ObjectId.isValid(String(session.user.organizationId)))) {
      return NextResponse.json(
        { message: 'Admin must belong to an organization' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { userId } = await params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (!callerIsSuper && (user.role === 'admin' || user.role === 'superadmin')) {
      return NextResponse.json(
        { message: 'Only super admins can modify organization assignment for admin accounts' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { organizationId } = body;

    // If organizationId is provided, validate it exists and is active
    if (organizationId) {
      if (typeof organizationId !== 'string' || !mongoose.Types.ObjectId.isValid(organizationId)) {
        return NextResponse.json(
          { message: 'Invalid organization ID' },
          { status: 400 }
        );
      }

      if (!callerIsSuper) {
        const adminOrgId = session.user.organizationId!.toString();
        if (adminOrgId !== organizationId) {
          return NextResponse.json(
            { message: 'Admin can only assign users to their own organization' },
            { status: 403 }
          );
        }
        if (user.organizationId && user.organizationId.toString() !== adminOrgId) {
          return NextResponse.json(
            { message: 'Cannot reassign a user who already belongs to another organization' },
            { status: 403 }
          );
        }
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

      user.organizationId = new mongoose.Types.ObjectId(organizationId);
    } else {
      if (!callerIsSuper) {
        const adminOrgId = session.user.organizationId!.toString();
        if (!user.organizationId || user.organizationId.toString() !== adminOrgId) {
          return NextResponse.json(
            { message: 'Admin can only remove users from their own organization' },
            { status: 403 }
          );
        }
      }
      // Remove user from organization
      user.organizationId = null;
    }

    await user.save();

    // Return updated user with organization populated (never expose password hash)
    const updatedUser = await User.findById(userId)
      .select('-password')
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
