import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course } from '@/models';
import { isStaffRole, isSuperAdmin } from '@/lib/roles';
import { logApiError, type LogContext } from '@/lib/logger';

function sanitizeSlug(title: string): string {
  const cleaned = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'course-image';
}

function getExtensionFromContentType(contentType: string): string {
  const normalized = contentType.split(';')[0].trim().toLowerCase();
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };
  return map[normalized] || 'jpg';
}

// GET /api/courses/[id]/thumbnail — Staff-only server fallback to download course image
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/courses/[id]/thumbnail',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!isStaffRole(session.user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    logContext.userId = session.user.id;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid course ID' }, { status: 400 });
    }

    await dbConnect();

    const course = await Course.findById(id)
      .select('title thumbnail instructor organizationId')
      .lean<{
        _id: unknown;
        title: string;
        thumbnail?: string;
        instructor?: unknown;
        organizationId?: unknown;
      }>();

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Scope authorization: superadmin = all, admin = own org or own course, teacher = own course
    const isSuper = isSuperAdmin(session.user.role);
    const isInstructor = course.instructor?.toString() === session.user.id;
    const isSameOrgAdmin =
      session.user.role === 'admin' &&
      Boolean(session.user.organizationId) &&
      course.organizationId?.toString() === session.user.organizationId?.toString();

    if (!isSuper && !isInstructor && !isSameOrgAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!course.thumbnail) {
      return NextResponse.json({ message: 'Course has no thumbnail' }, { status: 404 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(course.thumbnail);
    } catch {
      return NextResponse.json({ message: 'Invalid image URL' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return NextResponse.json({ message: 'Unsupported image protocol' }, { status: 400 });
    }

    const upstream = await fetch(parsedUrl.toString());
    if (!upstream.ok) {
      return NextResponse.json({ message: 'Failed to fetch image' }, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return NextResponse.json({ message: 'Upstream resource is not an image' }, { status: 400 });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const ext = getExtensionFromContentType(contentType);
    const filename = `${sanitizeSlug(course.title)}.${ext}`;

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/courses/[id]/thumbnail', logContext);
    return NextResponse.json({ message: 'Failed to download course image' }, { status: 500 });
  }
}
