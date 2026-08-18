// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { sanitizeSearchQuery, validateObjectId } from '@/lib/sanitize';
import { logApiError, type LogContext } from '@/lib/logger';
import { isAdmin, isSuperAdmin } from '@/lib/roles';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface QueryFilter { [key: string]: any }

// Helper to check admin access with organization-level authorization
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAdmin(session: any) {
  if (!session) {
    return { authorized: false, reason: 'No session' };
  }

  const userRole = session.user?.role;
  const userId = session.user?.id;
  const organizationId = session.user?.organizationId;

  // Use role hierarchy - admin or higher can access
  if (!isAdmin(userRole)) {
    return { authorized: false, reason: 'Insufficient role', userId };
  }

  return {
    authorized: true,
    role: userRole,
    userId,
    organizationId,
    isSuperAdmin: isSuperAdmin(userRole),
  };
}

// GET /api/admin/users - Get all users (Admin only)
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/admin/users',
  };

  try {
    const session = await getServerSession(authOptions);
    const authResult = await checkAdmin(session);

    if (!authResult.authorized) {
      console.error(`[SECURITY] Unauthorized access attempt to /api/admin/users - ${authResult.reason}`, {
        userId: authResult.userId,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (session?.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const organizationIdParam = searchParams.get('organizationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build query with sanitized inputs
    const query: QueryFilter = {};

    // STRICT ORGANIZATION FILTERING:
    // - Super admins can see ALL users (no filter) unless explicitly filtered
    // - Public admins (without organizationId) can see ONLY public users (users without organizationId)
    // - Organizational admins (with organizationId) can see ONLY users from their organization
    let orgFilter: QueryFilter = {};
    if (!authResult.isSuperAdmin) {
      // Regular admin (not superadmin)
      if (!authResult.organizationId) {
        // Public admin sees only public users (users without organization)
        orgFilter = { organizationId: null };
      } else {
        // Organizational admin sees only users from their organization
        orgFilter = { organizationId: authResult.organizationId };
      }
    } else if (organizationIdParam) {
      // Super admin optional organization filter
      if (organizationIdParam === 'null' || organizationIdParam === 'none') {
        orgFilter = { organizationId: null };
      } else if (validateObjectId(organizationIdParam)) {
        orgFilter = { organizationId: organizationIdParam };
      }
    }

    if (role) query.role = role;

    // Combine organization filter with search filter
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);
      const searchFilter = {
        $or: [
          { name: { $regex: sanitizedSearch, $options: 'i' } },
          { email: { $regex: sanitizedSearch, $options: 'i' } },
        ]
      };

      // If there's an organization filter, combine with $and
      if (Object.keys(orgFilter).length > 0) {
        query.$and = [orgFilter, searchFilter];
      } else {
        // Super admin or no org filter, just use search
        Object.assign(query, searchFilter);
      }
    } else {
      // No search, just apply organization filter
      Object.assign(query, orgFilter);
    }

    const [users, total, statsAgg, suspendedCount] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
      User.aggregate([
        { $match: orgFilter },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]),
      User.countDocuments({ ...orgFilter, isSuspended: true }),
    ]);

    const stats = {
      total: 0,
      students: 0,
      teachers: 0,
      admins: 0,
      superadmins: 0,
      suspended: suspendedCount,
    };

    statsAgg.forEach((item: { _id: string; count: number }) => {
      stats.total += item.count;
      if (item._id === 'student') stats.students = item.count;
      else if (item._id === 'teacher') stats.teachers = item.count;
      else if (item._id === 'admin') stats.admins = item.count;
      else if (item._id === 'superadmin') stats.superadmins = item.count;
    });

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
  const logContext: LogContext = {
    method: 'PATCH',
    path: '/api/admin/users',
  };

  try {
    const session = await getServerSession(authOptions);
    const authResult = await checkAdmin(session);

    if (!authResult.authorized) {
      console.error(`[SECURITY] Unauthorized PATCH attempt to /api/admin/users - ${authResult.reason}`, {
        userId: authResult.userId,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    if (session?.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const { userId, updates } = await request.json();

    if (!userId || !updates) {
      return NextResponse.json(
        { message: 'User ID and updates are required' },
        { status: 400 }
      );
    }

    // Validate ObjectId to prevent injection
    if (!validateObjectId(userId)) {
      return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }

    // Fetch target user to check organization
    const targetUser = await User.findById(userId).select('-password').lean();

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // ORGANIZATION-LEVEL AUTHORIZATION:
    // Regular admins can only update users from their own organization
    if (!authResult.isSuperAdmin) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const targetOrgId = (targetUser as any).organizationId?.toString();
      if (targetOrgId !== authResult.organizationId?.toString()) {
        console.error(`[SECURITY] Cross-organization update attempt blocked`, {
          adminUserId: authResult.userId,
          adminOrgId: authResult.organizationId,
          targetUserId: userId,
          targetOrgId,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json(
          { message: 'You can only update users from your organization' },
          { status: 403 }
        );
      }
    }
    // Super admin: no organization restriction

    // Prevent changing own role (to avoid locking yourself out)
    if (userId === session?.user?.id && updates.role && updates.role !== 'admin') {
      return NextResponse.json(
        { message: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Prevent suspending self
    if (userId === session?.user?.id && updates.isSuspended) {
      return NextResponse.json(
        { message: 'Cannot suspend your own account' },
        { status: 400 }
      );
    }

    // Prevent suspending other admins (only superadmin can do this)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((targetUser as any).role === 'admin' && updates.isSuspended && authResult.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Only super admins can suspend admin accounts' },
        { status: 403 }
      );
    }

    // Validate canCreatePublicCourses if provided
    if (updates.canCreatePublicCourses !== undefined && typeof updates.canCreatePublicCourses !== 'boolean') {
      return NextResponse.json(
        { message: 'canCreatePublicCourses must be a boolean' },
        { status: 400 }
      );
    }

    // Validate limits if provided
    if (updates.limits) {
      if (updates.limits.courses !== undefined && (typeof updates.limits.courses !== 'number' || updates.limits.courses < 1)) {
        return NextResponse.json(
          { message: 'Courses limit must be a positive integer' },
          { status: 400 }
        );
      }
      if (updates.limits.quizzes !== undefined && (typeof updates.limits.quizzes !== 'number' || updates.limits.quizzes < 1)) {
        return NextResponse.json(
          { message: 'Quizzes limit must be a positive integer' },
          { status: 400 }
        );
      }
      if (updates.limits.blogs !== undefined && (typeof updates.limits.blogs !== 'number' || updates.limits.blogs < 1)) {
        return NextResponse.json(
          { message: 'Blogs limit must be a positive integer' },
          { status: 400 }
        );
      }
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
  const logContext: LogContext = {
    method: 'DELETE',
    path: '/api/admin/users',
  };

  try {
    const session = await getServerSession(authOptions);
    const authResult = await checkAdmin(session);

    if (!authResult.authorized) {
      console.error(`[SECURITY] Unauthorized DELETE attempt to /api/admin/users - ${authResult.reason}`, {
        userId: authResult.userId,
        timestamp: new Date().toISOString(),
      });
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

    // Validate ObjectId to prevent injection
    if (!validateObjectId(userId)) {
      return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }

    // Prevent deleting self
    if (userId === session?.user?.id) {
      return NextResponse.json(
        { message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Fetch target user to check organization
    const targetUser = await User.findById(userId).select('-password').lean();

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // ORGANIZATION-LEVEL AUTHORIZATION:
    // Regular admins can only delete users from their own organization
    if (!authResult.isSuperAdmin) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const targetOrgId = (targetUser as any).organizationId?.toString();
      if (targetOrgId !== authResult.organizationId?.toString()) {
        console.error(`[SECURITY] Cross-organization delete attempt blocked`, {
          adminUserId: authResult.userId,
          adminOrgId: authResult.organizationId,
          targetUserId: userId,
          targetOrgId,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json(
          { message: 'You can only delete users from your organization' },
          { status: 403 }
        );
      }
    }
    // Super admin: no organization restriction

    // Prevent deleting superadmin accounts - no one can delete superadmins
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((targetUser as any).role === 'superadmin') {
      return NextResponse.json(
        { message: 'Super admin accounts cannot be deleted' },
        { status: 403 }
      );
    }

    // Prevent deleting other admins (only superadmin can do this)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((targetUser as any).role === 'admin' && !authResult.isSuperAdmin) {
      return NextResponse.json(
        { message: 'Only super admins can delete admin accounts' },
        { status: 403 }
      );
    }

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
