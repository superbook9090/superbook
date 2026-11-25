import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Organization, User, Course, Blog, Quiz } from '@/models';
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

    // Aggregate counts across all organizations in 4 constant-time queries (avoids 4*N N+1 queries)
    const orgIds = organizations.map((org) => org._id);
    const [userAgg, courseAgg, blogAgg, quizAgg] = orgIds.length
      ? await Promise.all([
          User.aggregate<{ _id: unknown; count: number }>([
            { $match: { organizationId: { $in: orgIds } } },
            { $group: { _id: '$organizationId', count: { $sum: 1 } } },
          ]),
          Course.aggregate<{ _id: unknown; count: number }>([
            { $match: { organizationId: { $in: orgIds } } },
            { $group: { _id: '$organizationId', count: { $sum: 1 } } },
          ]),
          Blog.aggregate<{ _id: unknown; count: number }>([
            { $match: { organizationId: { $in: orgIds } } },
            { $group: { _id: '$organizationId', count: { $sum: 1 } } },
          ]),
          Quiz.aggregate<{ _id: unknown; count: number }>([
            { $match: { organizationId: { $in: orgIds } } },
            { $group: { _id: '$organizationId', count: { $sum: 1 } } },
          ]),
        ])
      : [[], [], [], []];

    const toCountMap = (rows: Array<{ _id: unknown; count: number }>) => {
      const map = new Map<string, number>();
      for (const row of rows) {
        if (row._id) map.set(String(row._id), row.count);
      }
      return map;
    };

    const userCountMap = toCountMap(userAgg);
    const courseCountMap = toCountMap(courseAgg);
    const blogCountMap = toCountMap(blogAgg);
    const quizCountMap = toCountMap(quizAgg);

    const orgsWithCounts = organizations.map((org) => {
      const idStr = String(org._id);
      return {
        ...org,
        userCount: userCountMap.get(idStr) ?? 0,
        courseCount: courseCountMap.get(idStr) ?? 0,
        blogCount: blogCountMap.get(idStr) ?? 0,
        quizCount: quizCountMap.get(idStr) ?? 0,
      };
    });

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
    const { name, description, logo, primaryColor, website, tagline } = body;

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
    let [codeExists, inviteExists] = await Promise.all([
      Organization.exists({ code }),
      Organization.exists({ inviteCode }),
    ]);

    // Retry if collision
    let attempts = 0;
    while ((codeExists || inviteExists) && attempts < 10) {
      code = generateOrgCode();
      inviteCode = generateInviteCode();
      [codeExists, inviteExists] = await Promise.all([
        Organization.exists({ code }),
        Organization.exists({ inviteCode }),
      ]);
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
      logo: logo || null,
      primaryColor: primaryColor || null,
      website: website || null,
      tagline: tagline || null,
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
