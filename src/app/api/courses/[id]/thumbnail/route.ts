import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course } from '@/models';
import { isStaffRole, isSuperAdmin } from '@/lib/roles';
import { logApiError, type LogContext } from '@/lib/logger';

const STATIC_ALLOWED_THUMBNAIL_HOSTS = new Set([
  'res.cloudinary.com',
  'i.ytimg.com',
  'img.youtube.com',
  'lh3.googleusercontent.com',
]);

function isIpLiteralOrPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    !lower ||
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    !lower.includes('.')
  ) {
    return true;
  }
  // Reject IPv6 literals
  if (lower.startsWith('[') || lower.includes(':')) {
    return true;
  }
  // Reject IPv4 literals (dotted quad, decimal, octal, hex)
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(lower) || /^(0x[\da-f]+|\d+)$/i.test(lower)) {
    return true;
  }
  return false;
}

function getAllowedThumbnailHosts(): Set<string> {
  const allowed = new Set(STATIC_ALLOWED_THUMBNAIL_HOSTS);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const parsedSite = new URL(siteUrl);
      if (parsedSite.protocol === 'https:' && !isIpLiteralOrPrivateHost(parsedSite.hostname)) {
        allowed.add(parsedSite.hostname.toLowerCase());
      }
    } catch {
      // Ignore malformed NEXT_PUBLIC_SITE_URL
    }
  }
  return allowed;
}

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

    // SSRF protection: HTTPS only, no credentials/custom ports, no IP/private hosts, allowlisted CDNs only
    if (parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ message: 'Only HTTPS image URLs are allowed' }, { status: 400 });
    }

    if (parsedUrl.username || parsedUrl.password || (parsedUrl.port && parsedUrl.port !== '443')) {
      return NextResponse.json({ message: 'Invalid image URL' }, { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (isIpLiteralOrPrivateHost(hostname) || !getAllowedThumbnailHosts().has(hostname)) {
      return NextResponse.json({ message: 'Image host is not allowed' }, { status: 400 });
    }

    let upstream: Response;
    try {
      upstream = await fetch(parsedUrl.toString(), { redirect: 'error' });
    } catch {
      return NextResponse.json({ message: 'Failed to fetch image' }, { status: 502 });
    }
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
