import { NextRequest, NextResponse } from 'next/server';
import { incrementPublicBlogView } from '@/lib/blogs/public';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const logContext: LogContext = { method: 'POST', path: '/api/blogs/public/[slug]/view' };
  try {
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const { slug } = await params;
    await incrementPublicBlogView(slug);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/blogs/public/[slug]/view', logContext);
    return NextResponse.json({ message: 'Failed to update blog view count' }, { status: 500 });
  }
}
