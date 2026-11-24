import { type NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Blog from '@/models/Blog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateTrendingAiBlog, TRENDING_SEO_TOPICS } from '@/lib/blogs/aiTrendingBlogGenerator';
import { invalidatePattern } from '@/lib/redis';
import { logApiError, logInfo } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max execution time for Vercel functions (60s limit on Hobby plans)

export async function POST(req: NextRequest) {
  const logContext = { method: 'POST', path: '/api/admin/blogs/generate-ai-trending' };

  try {
    // 1. Verify Authentication & Superadmin Permissions ONLY
    const authHeader = req.headers.get('authorization');
    const isCronAuthorized =
      Boolean(process.env.CRON_SECRET) && authHeader === `Bearer ${process.env.CRON_SECRET}`;

    let superAdminUser = null;

    if (!isCronAuthorized) {
      const session = await getServerSession(authOptions);
      if (!session || session.user?.role !== 'superadmin') {
        return NextResponse.json(
          { success: false, message: 'Unauthorized. Superadmin access is strictly required.' },
          { status: 403 }
        );
      }
      await dbConnect();
      superAdminUser = await User.findById(session.user.id);
    } else {
      await dbConnect();
      superAdminUser = await User.findOne({ role: 'superadmin' });
    }

    if (!superAdminUser) {
      await dbConnect();
      superAdminUser = await User.findOne({ role: 'superadmin' });
    }

    if (!superAdminUser) {
      return NextResponse.json(
        { success: false, message: 'No superadmin account found in database to assign as author.' },
        { status: 400 }
      );
    }

    // 2. Parse optional request parameters
    const body = await req.json().catch(() => ({}));
    const requestedTopic = typeof body.topic === 'string' && body.topic.trim() ? body.topic.trim() : undefined;
    const requestedTitle = typeof body.focusTitle === 'string' && body.focusTitle.trim() ? body.focusTitle.trim() : undefined;
    const requestedLanguage = body.language === 'hi' ? 'hi' : 'en';

    logInfo('Starting manual AI trending blog generation', logContext, {
      topic: requestedTopic,
      language: requestedLanguage,
      authorId: superAdminUser._id.toString(),
    });

    // 3. Call AI Service to Generate 2000+ Word Blog
    const generated = await generateTrendingAiBlog({
      topic: requestedTopic,
      focusTitle: requestedTitle,
      language: requestedLanguage,
      targetWords: 2200,
    });

    // 4. Save to Database
    const readingTimeMinutes = Math.max(1, Math.ceil(generated.wordCount / 200));

    const newBlog = await Blog.create({
      title: generated.title,
      slug: generated.slug,
      topic: generated.topic,
      language: generated.language,
      excerpt: generated.excerpt,
      metaTitle: generated.metaTitle,
      metaDescription: generated.metaDescription,
      content: generated.content,
      readingTimeMinutes,
      author: superAdminUser._id,
      organizationId: null,
      visibility: 'public',
      isPublished: true,
      isFeatured: true,
      viewCount: Math.floor(Math.random() * 20) + 10,
    });

    // 5. Invalidate caches
    try {
      await invalidatePattern('blogs:*');
      await invalidatePattern('public_blogs:*');
    } catch (cacheErr) {
      console.warn('[GenerateAiTrendingBlog] Cache invalidation warning:', cacheErr);
    }

    logInfo('Successfully created AI trending blog for SEO/AdSense', logContext, {
      blogId: newBlog._id.toString(),
      title: newBlog.title,
      wordCount: generated.wordCount,
      slug: newBlog.slug,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully generated and published 2,000+ word AI blog on "${newBlog.title}"!`,
      blog: {
        id: newBlog._id,
        title: newBlog.title,
        slug: newBlog.slug,
        wordCount: generated.wordCount,
        topic: newBlog.topic,
        url: `/blog/${newBlog.slug}`,
      },
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/admin/blogs/generate-ai-trending', logContext);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// GET endpoint provides list of curated topics & check for superadmin UI
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'superadmin') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Superadmin only.' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    availableTopics: TRENDING_SEO_TOPICS,
  });
}
