import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Organization from '@/models/Organization';
import { logApiError, type LogContext } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/organizations/lookup',
  };

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.trim();

    if (!code || code.length > 64) {
      return NextResponse.json({ found: false, message: 'Code is required' }, { status: 400 });
    }

    await dbConnect();

    const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedCode}$`, 'i');

    const org = await Organization.findOne({
      $or: [{ inviteCode: regex }, { teacherInviteCode: regex }, { code: regex }],
      isActive: true,
    })
      .select('_id name logo primaryColor website tagline inviteCode teacherInviteCode description')
      .lean<{
        _id: unknown;
        name: string;
        logo?: string;
        primaryColor?: string;
        website?: string;
        tagline?: string;
        inviteCode: string;
        teacherInviteCode?: string;
        description?: string;
      }>();

    if (!org) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const isTeacherCode =
      Boolean(org.teacherInviteCode) &&
      org.teacherInviteCode!.toLowerCase() === code.toLowerCase();

    return NextResponse.json(
      {
        found: true,
        organization: {
          id: String(org._id),
          name: org.name,
          logo: org.logo || null,
          primaryColor: org.primaryColor || null,
          website: org.website || null,
          tagline: org.tagline || null,
          inviteCode: isTeacherCode ? org.teacherInviteCode : org.inviteCode,
          inviteRole: isTeacherCode ? 'teacher' : 'student',
          description: org.description || null,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/organizations/lookup', logContext);
    return NextResponse.json({ found: false, message: 'Lookup error' }, { status: 500 });
  }
}
