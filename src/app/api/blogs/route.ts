import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { createBlogSchema } from '@/lib/validation';
import { logApiError, logFailedRequest, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { requireFeature, checkTeacherLimit } from '@/lib/settingsHelpers';
import { sanitizeHtml } from '@/lib/sanitize';

// GET /api/blogs - Get all published blogs
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('X-Request-ID') || 'unknown';
  const logContext: LogContext = {
    requestId,
    method: 'GET',
    path: '/api/blogs',
  };

  try {
    await dbConnect();

    // Check if blogs feature is enabled
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic');
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

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

    return NextResponse.json({
      blogs: serializedBlogs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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

    const blog = await Blog.create({
      title,
      content: sanitizedContent,
      topic,
      language,
      author: session.user.id,
      isPublished,
    });

    await blog.populate('author', 'name');

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/blogs', logContext);
    return NextResponse.json(
      { message: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
