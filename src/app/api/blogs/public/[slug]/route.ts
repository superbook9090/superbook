import { NextRequest, NextResponse } from 'next/server';
import { getPublicBlogBySlug, listRelatedPublicBlogs } from '@/lib/blogs/public';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';

export const revalidate = 300;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const logContext: LogContext = { method: 'GET', path: '/api/blogs/public/[slug]' };
  try {
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const { slug } = await params;
    const blog = await getPublicBlogBySlug(slug);
    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    const related = await listRelatedPublicBlogs(blog.slug, blog.topic, 3);
    return NextResponse.json({ blog, related }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/blogs/public/[slug]', logContext);
    return NextResponse.json({ message: 'Failed to fetch public blog' }, { status: 500 });
  }
}
