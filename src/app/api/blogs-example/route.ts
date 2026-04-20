// Example API route demonstrating middleware system
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { requireFeature } from '@/lib/settingsHelpers';
import {
  withMiddleware,
  withRateLimit,
  withCache,
  withSecurityHeaders,
  type MiddlewareContext,
} from '@/lib/apiMiddleware';
import { logError, type LogContext } from '@/lib/logger';

// Handler function with middleware applied
async function getBlogsHandler(context: MiddlewareContext): Promise<NextResponse> {
  const { request } = context;
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/blogs-example',
  };

  try {
    await dbConnect();

    // Check if blogs feature is enabled
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const query: { isPublished: boolean; topic?: string; language?: string } = { isPublished: true };
    if (topic) {
      query.topic = topic;
    }
    if (language && (language === 'en' || language === 'hi')) {
      query.language = language;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Blog.countDocuments(query);

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError('Error fetching blogs', logContext, error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// Apply middleware: rate limit, cache, security headers
export const GET = withMiddleware(
  getBlogsHandler,
  withRateLimit('general'),
  withCache(300, 600),
  withSecurityHeaders()
);

// Example POST handler with authentication
async function createBlogHandler(context: MiddlewareContext): Promise<NextResponse> {
  const { request, userId, userRole } = context;
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/blogs-example',
    userId,
  };

  try {
    const body = await request.json();

    // Only teachers and admins can create blogs
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Only teachers can create blogs' },
        { status: 403 }
      );
    }

    // Validation and creation logic here...
    // (omitted for brevity - see actual blogs/route.ts)

    return NextResponse.json({ message: 'Blog created' }, { status: 201 });
  } catch (error) {
    logError('Error creating blog', logContext, error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// Apply middleware: auth, rate limit (stricter for auth), security headers
export const POST = withMiddleware(
  createBlogHandler,
  withRateLimit('auth'),
  withSecurityHeaders()
);
