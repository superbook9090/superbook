import { NextRequest, NextResponse } from 'next/server';
import { listPublicBlogs, listPublicBlogTopics } from '@/lib/blogs/public';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/blogs/public' };
  try {
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '12');
    const topic = searchParams.get('topic') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') === 'popular' ? 'popular' : 'latest';
    const featuredOnly = searchParams.get('featured') === 'true';

    const [data, topics] = await Promise.all([
      listPublicBlogs({ page, limit, topic, search, sort, featuredOnly }),
      listPublicBlogTopics(),
    ]);

    return NextResponse.json({ ...data, topics }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/blogs/public', logContext);
    return NextResponse.json({ message: 'Failed to fetch public blogs' }, { status: 500 });
  }
}
