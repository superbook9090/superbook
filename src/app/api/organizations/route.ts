import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Organization from '@/models/Organization';
import User from '@/models/User';
import Course from '@/models/Course';
import Blog from '@/models/Blog';
import Quiz from '@/models/Quiz';
import { logApiError, type LogContext } from '@/lib/logger';
import { generateInviteCode, generateOrgCode } from '@/lib/inviteCode';
import { serialize } from '@/lib/serialize';

// GET /api/organizations - List all organizations (admin only)
export async function GET(req: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/organizations',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only superadmins can view organizations
    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    logContext.userId = session.user.id;

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query: { isActive?: boolean } = {};
    if (!includeInactive) {
      query.isActive = true;
    }

    const organizations = await Organization.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Get user count for each organization
    const orgsWithCounts = await Promise.all(
      organizations.map(async (org) => {
        const userCount = await User.countDocuments({ organizationId: org._id });
        const courseCount = await Course.countDocuments({ organizationId: org._id });
        const blogCount = await Blog.countDocuments({ organizationId: org._id });
        const quizCount = await Quiz.countDocuments({ organizationId: org._id });

        return {
          ...org,
          userCount,
          courseCount,
          blogCount,
          quizCount,
        };
      })
    );

    const serializedOrgs = serialize(orgsWithCounts);

    return NextResponse.json({ organizations: serializedOrgs });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/organizations', logContext);
    return NextResponse.json(
      { message: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create organization (admin only)
export async function POST(req: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/organizations',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only superadmins can create organizations
    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    logContext.userId = session.user.id;

    await dbConnect();

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate unique codes
    let code = generateOrgCode();
    let inviteCode = generateInviteCode();

    // Ensure codes are unique
    let codeExists = await Organization.findOne({ code });
    let inviteExists = await Organization.findOne({ inviteCode });

    // Retry if collision
    let attempts = 0;
    while ((codeExists || inviteExists) && attempts < 10) {
      code = generateOrgCode();
      inviteCode = generateInviteCode();
      codeExists = await Organization.findOne({ code });
      inviteExists = await Organization.findOne({ inviteCode });
      attempts++;
    }

    if (codeExists || inviteExists) {
      return NextResponse.json(
        { message: 'Failed to generate unique codes' },
        { status: 500 }
      );
    }

    const organization = new Organization({
      name,
      code,
      inviteCode,
      description,
      isActive: true,
    });

    await organization.save();

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/organizations', logContext);
    return NextResponse.json(
      { message: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
