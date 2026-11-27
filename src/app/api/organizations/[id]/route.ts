import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Organization, User, Course, Blog, Quiz } from '@/models';
import { logApiError, type LogContext } from '@/lib/logger';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { ensureTeacherInviteCode } from '@/lib/organizations/resolveInvite';
import {
  sanitizeOrganizationPermissions,
  sanitizeOrganizationTeacherLimits,
} from '@/lib/admin/orgPolicy';

// GET /api/organizations/[id] - Fetch organization details
export async function GET(
  req: NextRequest,
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid organization ID' }, { status: 400 });
    }

    // Check permissions: Superadmins can view any; others can view only their own
    const isSuper = isSuperAdmin(session.user.role);
    const isOwnOrg = session.user.organizationId?.toString() === id;

    if (!isSuper && !isOwnOrg) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const organization = await Organization.findById(id).lean();
    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    const orgObjectId = new mongoose.Types.ObjectId(id);
    const isAdminOrSuper = isSuper || isAdmin(session.user.role);
    const includeDetails = req.nextUrl.searchParams.get('includeDetails') === 'true';
    const canViewDetails = includeDetails && (isSuper || (isOwnOrg && isAdmin(session.user.role)));

    const orgRecord = organization as Record<string, unknown>;
    let sanitizedOrganization: Record<string, unknown>;
    if (!isAdminOrSuper) {
      const {
        inviteCode: _inviteCode,
        teacherInviteCode: _teacherInviteCode,
        code: _code,
        permissions: _permissions,
        teacherLimits: _teacherLimits,
        ...publicFields
      } = orgRecord;
      void _inviteCode;
      void _teacherInviteCode;
      void _code;
      void _permissions;
      void _teacherLimits;
      sanitizedOrganization = publicFields;
    } else {
      const teacherInviteCode =
        (typeof orgRecord.teacherInviteCode === 'string' && orgRecord.teacherInviteCode) ||
        (await ensureTeacherInviteCode(orgObjectId));
      sanitizedOrganization = {
        ...orgRecord,
        teacherInviteCode,
      };
    }

    const [userCount, courseCount, blogCount, quizCount] = await Promise.all([
      User.countDocuments({ organizationId: orgObjectId }),
      Course.countDocuments({ organizationId: orgObjectId }),
      Blog.countDocuments({ organizationId: orgObjectId }),
      Quiz.countDocuments({ organizationId: orgObjectId }),
    ]);

    if (!canViewDetails) {
      return NextResponse.json({
        ...sanitizedOrganization,
        userCount,
        courseCount,
        blogCount,
        quizCount,
      });
    }

    const [roleAgg, usersRaw, coursesRaw, quizzesRaw, blogsRaw] = await Promise.all([
      User.aggregate<{ _id: string; count: number }>([
        { $match: { organizationId: orgObjectId } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      User.find({ organizationId: orgObjectId })
        .select('_id name email phone role isSuspended lastPlatform lastActiveAt createdAt')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      Course.find({ organizationId: orgObjectId })
        .select('_id title category isPublished enrolledCount lessonCount createdAt instructor')
        .populate('instructor', 'name email')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      Quiz.find({ organizationId: orgObjectId })
        .select('_id title isPublished questionCount timeLimit createdAt course instructor')
        .populate('course', 'title')
        .populate('instructor', 'name')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      Blog.find({ organizationId: orgObjectId })
        .select('_id title slug category isPublished views createdAt author')
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
    ]);

    const roleBreakdown = { students: 0, teachers: 0, admins: 0 };
    for (const row of roleAgg) {
      if (row._id === 'student') roleBreakdown.students = row.count;
      else if (row._id === 'teacher') roleBreakdown.teachers = row.count;
      else if (row._id === 'admin' || row._id === 'superadmin') roleBreakdown.admins += row.count;
    }

    const users = (usersRaw as Array<Record<string, unknown>>).map((u) => ({
      _id: String(u._id),
      name: String(u.name || ''),
      email: String(u.email || ''),
      phone: u.phone ? String(u.phone) : undefined,
      role: String(u.role || 'student'),
      isSuspended: Boolean(u.isSuspended),
      lastPlatform: u.lastPlatform ? String(u.lastPlatform) : undefined,
      lastActiveAt: u.lastActiveAt ? new Date(String(u.lastActiveAt)).toISOString() : undefined,
      createdAt: u.createdAt ? new Date(String(u.createdAt)).toISOString() : '',
    }));

    const courses = (coursesRaw as Array<Record<string, unknown>>).map((c) => {
      const inst = c.instructor as { name?: string; email?: string } | null | undefined;
      return {
        _id: String(c._id),
        title: String(c.title || ''),
        category: String(c.category || ''),
        isPublished: Boolean(c.isPublished),
        enrolledCount: Number(c.enrolledCount ?? 0),
        lessonCount: Number(c.lessonCount ?? 0),
        instructorName: inst && typeof inst === 'object' ? inst.name || '' : '',
        createdAt: c.createdAt ? new Date(String(c.createdAt)).toISOString() : '',
      };
    });

    const quizzes = (quizzesRaw as Array<Record<string, unknown>>).map((q) => {
      const courseObj = q.course as { title?: string } | null | undefined;
      const inst = q.instructor as { name?: string } | null | undefined;
      return {
        _id: String(q._id),
        title: String(q.title || ''),
        isPublished: Boolean(q.isPublished),
        questionCount: Number(q.questionCount ?? 0),
        timeLimit: Number(q.timeLimit ?? 0),
        courseTitle: courseObj && typeof courseObj === 'object' ? courseObj.title || '' : '',
        instructorName: inst && typeof inst === 'object' ? inst.name || '' : '',
        createdAt: q.createdAt ? new Date(String(q.createdAt)).toISOString() : '',
      };
    });

    const blogs = (blogsRaw as Array<Record<string, unknown>>).map((b) => {
      const author = b.author as { name?: string } | null | undefined;
      return {
        _id: String(b._id),
        title: String(b.title || ''),
        slug: String(b.slug || ''),
        category: String(b.category || ''),
        isPublished: Boolean(b.isPublished),
        views: Number(b.views ?? 0),
        authorName: author && typeof author === 'object' ? author.name || '' : '',
        createdAt: b.createdAt ? new Date(String(b.createdAt)).toISOString() : '',
      };
    });

    return NextResponse.json({
      ...sanitizedOrganization,
      userCount,
      courseCount,
      blogCount,
      quizCount,
      details: {
        roleBreakdown,
        users,
        courses,
        quizzes,
        blogs,
      },
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid organization ID' },
        { status: 400 }
      );
    }

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
    const {
      name,
      description,
      isActive,
      logo,
      primaryColor,
      website,
      tagline,
      permissions,
      teacherLimits,
    } = body;

    if ((permissions !== undefined || teacherLimits !== undefined) && !isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Only super admins can configure organization permissions and quotas' },
        { status: 403 }
      );
    }

    if (isActive !== undefined && !isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Only super admins can change organization active status' },
        { status: 403 }
      );
    }

    if (permissions !== undefined) {
      const permResult = sanitizeOrganizationPermissions(permissions);
      if (permResult.error) {
        return NextResponse.json({ message: permResult.error }, { status: 400 });
      }
      if (permResult.value) {
        organization.permissions = {
          ...(organization.permissions || {}),
          ...permResult.value,
        };
      }
    }

    if (teacherLimits !== undefined) {
      const limitsResult = sanitizeOrganizationTeacherLimits(teacherLimits);
      if (limitsResult.error) {
        return NextResponse.json({ message: limitsResult.error }, { status: 400 });
      }
      if (limitsResult.value) {
        organization.teacherLimits = limitsResult.value;
      }
    }

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

    // Only superadmins can delete organizations
    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    logContext.userId = session.user.id;

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid organization ID' },
        { status: 400 }
      );
    }

    const organization = await Organization.findById(id);

    if (!organization) {
      return NextResponse.json(
        { message: 'Organization not found' },
        { status: 404 }
      );
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
