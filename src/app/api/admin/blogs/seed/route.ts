import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isSuperAdmin, isAdmin } from '@/lib/roles';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { seedEducationalArticles, SEED_ARTICLES } from '@/lib/blogs/seedAdsenseArticles';
import { logApiError, type LogContext } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!isSuperAdmin(session.user.role) && !isAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Only Super Administrators can inspect content seeding status.' },
        { status: 403 }
      );
    }

    await dbConnect();
    const slugs = SEED_ARTICLES.map((a) => a.slug);
    const seededCount = await Blog.countDocuments({ slug: { $in: slugs } });

    return NextResponse.json({
      isSeeded: seededCount >= SEED_ARTICLES.length,
      seededCount,
      totalExpected: SEED_ARTICLES.length,
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message || 'Failed to check seed status' },
      { status: 500 }
    );
  }
}

export async function POST() {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/admin/blogs/seed',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    logContext.userId = session.user.id;

    // Only superadmin or admin can execute database seeding
    if (!isSuperAdmin(session.user.role) && !isAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Only Super Administrators can execute platform content seeding.' },
        { status: 403 }
      );
    }

    const result = await seedEducationalArticles(session.user.id);

    return NextResponse.json({
      message: 'Educational articles successfully seeded and test posts unpublished.',
      ...result,
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/admin/blogs/seed', logContext);
    return NextResponse.json(
      { message: (error as Error).message || 'Failed to seed educational articles.' },
      { status: 500 }
    );
  }
}
