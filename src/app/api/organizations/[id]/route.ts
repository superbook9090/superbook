import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Organization, User, Course, Blog, Quiz } from '@/models';
import { logApiError, type LogContext } from '@/lib/logger';

// GET /api/organizations/[id] - Fetch organization details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/organizations/[id]',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    // Check permissions: Superadmins can view any; others can view only their own
    const isSuper = session.user.role === 'superadmin';
    const isOwnOrg = session.user.organizationId?.toString() === id;

    if (!isSuper && !isOwnOrg) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const organization = await Organization.findById(id).lean();
    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    const [userCount, courseCount, blogCount, quizCount] = await Promise.all([
      User.countDocuments({ organizationId: id }),
      Course.countDocuments({ organizationId: id }),
      Blog.countDocuments({ organizationId: id }),
      Quiz.countDocuments({ organizationId: id }),
    ]);

    return NextResponse.json({
      ...organization,
      userCount,
      courseCount,
      blogCount,
      quizCount,
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/organizations/[id]', logContext);
    return NextResponse.json({ message: 'Failed to fetch organization' }, { status: 500 });
  }
}

// PATCH /api/organizations/[id] - Update organization (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'PATCH',
    path: '/api/organizations/[id]',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins and superadmins can update organizations
    if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    logContext.userId = session.user.id;

    await dbConnect();
    const { id } = await params;

    const organization = await Organization.findById(id);

    if (!organization) {
      return NextResponse.json(
        { message: 'Organization not found' },
        { status: 404 }
      );
    }

    // Admin can only update their own organization
    if (session.user.role === 'admin') {
      if (!session.user.organizationId) {
        return NextResponse.json(
          { message: 'Admin must belong to an organization' },
          { status: 403 }
        );
      }
      if (session.user.organizationId.toString() !== id) {
        return NextResponse.json(
          { message: 'Admin can only update their own organization' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { name, description, isActive, logo, primaryColor, website, tagline } = body;

    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (logo !== undefined) organization.logo = logo;
    if (primaryColor !== undefined) organization.primaryColor = primaryColor;
    if (website !== undefined) organization.website = website;
    if (tagline !== undefined) organization.tagline = tagline;
    if (typeof isActive === 'boolean') organization.isActive = isActive;

    await organization.save();

    return NextResponse.json(organization);
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/organizations/[id]', logContext);
    return NextResponse.json(
      { message: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id] - Delete organization (admin only with safety checks)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'DELETE',
    path: '/api/organizations/[id]',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins and superadmins can delete organizations
    if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    logContext.userId = session.user.id;

    await dbConnect();
    const { id } = await params;

    const organization = await Organization.findById(id);

    if (!organization) {
      return NextResponse.json(
        { message: 'Organization not found' },
        { status: 404 }
      );
    }

    // Admin can only delete their own organization
    if (session.user.role === 'admin') {
      if (!session.user.organizationId) {
        return NextResponse.json(
          { message: 'Admin must belong to an organization' },
          { status: 403 }
        );
      }
      if (session.user.organizationId.toString() !== id) {
        return NextResponse.json(
          { message: 'Admin can only delete their own organization' },
          { status: 403 }
        );
      }
    }

    // Safety check: Count users assigned to this organization
    const userCount = await User.countDocuments({ organizationId: id });
    if (userCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete organization: ${userCount} user(s) are still assigned. Remove users first.` },
        { status: 400 }
      );
    }

    // Safety check: Count content associated with this organization
    const courseCount = await Course.countDocuments({ organizationId: id });
    const blogCount = await Blog.countDocuments({ organizationId: id });
    const quizCount = await Quiz.countDocuments({ organizationId: id });

    if (courseCount > 0 || blogCount > 0 || quizCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete organization: Content still exists (${courseCount} courses, ${blogCount} blogs, ${quizCount} quizzes). Remove content first.` },
        { status: 400 }
      );
    }

    await Organization.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/organizations/[id]', logContext);
    return NextResponse.json(
      { message: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
