import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { createBlogSchema } from '@/lib/validation';
import { logApiError, logFailedRequest, type LogContext } from '@/lib/logger';
import { requireFeature, checkTeacherLimit } from '@/lib/settingsHelpers';
import { sanitizeHtml } from '@/lib/sanitize';
import mongoose from 'mongoose';
import { getAccessFilter } from '@/lib/accessControl';
import { getCachedData, setCachedData, invalidatePattern } from '@/lib/redis';
import { revalidateTag } from 'next/cache';

// Configure Next.js caching for this route
export const dynamic = 'force-dynamic';

// GET /api/blogs - Get all published blogs
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('X-Request-ID') || 'unknown';
  const logContext: LogContext = {
    requestId,
    method: 'GET',
    path: '/api/blogs',
  };

  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic');
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    const orgId = searchParams.get('orgId') || 'public';

    // Build cache key
    const cacheKey = `blogs:${orgId}:${topic || 'all'}:${language || 'all'}:${page}:${limit}:${includeDrafts}`;

    // Try to get from cache first (only for published blogs without drafts)
    if (!includeDrafts) {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    await dbConnect();

    // Check if blogs feature is enabled
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const query: { isPublished?: boolean; topic?: string; language?: string } = {};
    if (!includeDrafts) {
      query.isPublished = true;
    }
    if (topic) {
      query.topic = topic;
    }
    if (language && (language === 'en' || language === 'hi')) {
      query.language = language;
    }

    // Apply organization-based access control
    if (session?.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      const accessFilter = getAccessFilter({
        _id: new mongoose.Types.ObjectId(user.id),
        organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
        role: user.role as 'student' | 'teacher' | 'admin',
      });
      Object.assign(query, accessFilter);
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Convert ObjectIds to strings for Next.js serialization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedBlogs = blogs.map((blog: any) => ({
      ...blog,
      _id: blog._id?.toString(),
      author: blog.author ? {
        ...blog.author,
        _id: blog.author._id?.toString(),
      } : blog.author,
    }));

    const total = await Blog.countDocuments(query);

    const responseData = {
      blogs: serializedBlogs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache the response (only for published blogs)
    if (!includeDrafts) {
      await setCachedData(cacheKey, responseData, 300); // 5 minutes
    }

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/blogs', logContext);
    return NextResponse.json(
      { message: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog (teacher only)
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('X-Request-ID') || 'unknown';
  const logContext: LogContext = {
    requestId,
    method: 'POST',
    path: '/api/blogs',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      logFailedRequest(401, 'POST', '/api/blogs', logContext);
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    logContext.userId = session.user.id;

    // Check if blogs feature is enabled
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    if (session.user.role !== 'teacher' && session.user.role !== 'admin') {
      logFailedRequest(403, 'POST', '/api/blogs', logContext);
      return NextResponse.json(
        { message: 'Only teachers can create blogs' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input using Zod schema
    const validationResult = createBlogSchema.safeParse(body);
    if (!validationResult.success) {
      logFailedRequest(400, 'POST', '/api/blogs', logContext, validationResult.error);
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, content, topic, language = 'en', isPublished = true } = validationResult.data;

    // Sanitize HTML content to prevent XSS
    const sanitizedContent = sanitizeHtml(content);

    // Check teacher limits (skip for admins)
    if (session.user.role === 'teacher') {
      const blogCount = await Blog.countDocuments({
        author: session.user.id,
      });

      const limitCheck = await checkTeacherLimit('blogs', blogCount, session.user.id);
      if (limitCheck) return limitCheck;
    }

    if (!['en', 'hi'].includes(language)) {
      logFailedRequest(400, 'POST', '/api/blogs', logContext, new Error('Invalid language'));
      return NextResponse.json(
        { message: 'Language must be either en or hi' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get organizationId from session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const organizationId = user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null;

    const blog = await Blog.create({
      title,
      content: sanitizedContent,
      topic,
      language,
      author: session.user.id,
      organizationId,
      isPublished,
    });

    await blog.populate('author', 'name');

    // Invalidate cache for this organization
    const orgId = organizationId?.toString() || 'public';
    await invalidatePattern(`blogs:${orgId}:*`);
    
    // Revalidate Next.js cache tag
    revalidateTag(`blogs:${orgId}`);

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/blogs', logContext);
    return NextResponse.json(
      { message: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
