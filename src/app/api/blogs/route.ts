import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { createBlogSchema } from '@/lib/validation';
import { logApiError, logFailedRequest, type LogContext } from '@/lib/logger';
import { requireFeature, checkTeacherLimit } from '@/lib/settingsHelpers';
import { sanitizeHtml } from '@/lib/sanitize';
import mongoose from 'mongoose';
import { getAccessFilter } from '@/lib/accessControl';
import { getCachedData, setCachedData, invalidatePattern } from '@/lib/redis';
import { revalidateTag } from 'next/cache';
import { parseOffsetPagination } from '@/lib/server/pagination';
import { blogTopicValues, type BlogTopicKey } from '@/i18n/config';

export const dynamic = 'force-dynamic';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildTopicFilter(topic: string) {
  const mapped = blogTopicValues[topic as BlogTopicKey];
  const value = mapped ?? topic;
  return { topic: { $regex: new RegExp(`^${escapeRegex(value)}$`, 'i') } };
}

// GET /api/blogs - List blogs with server-side filters and pagination
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
    const { page, limit, skip } = parseOffsetPagination(searchParams, { defaultLimit: 10 });
    const topic = searchParams.get('topic');
    const language = searchParams.get('language');
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'all';
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    const author = searchParams.get('author');
    const orgId = searchParams.get('orgId') || 'public';
    const includeStats = searchParams.get('includeStats') === 'true';

    const canUseCache = !includeDrafts && !search && !author && status === 'all' && !topic && !language;
    const cacheKey = `blogs:${orgId}:${page}:${limit}`;

    if (canUseCache) {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    await dbConnect();

    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const andFilters: Record<string, unknown>[] = [];

    if (status === 'published') {
      andFilters.push({ isPublished: true });
    } else if (status === 'draft') {
      andFilters.push({ isPublished: false });
    } else if (!includeDrafts) {
      andFilters.push({ isPublished: true });
    }

    if (topic && topic !== 'all') {
      andFilters.push(buildTopicFilter(topic));
    }

    if (language && language !== 'all' && (language === 'en' || language === 'hi')) {
      andFilters.push({ language });
    }

    if (session?.user) {
      const user = session.user as {
        id: string;
        organizationId?: string | null;
        role: 'student' | 'teacher' | 'admin' | 'superadmin';
      };
      const accessFilter = getAccessFilter({
        _id: new mongoose.Types.ObjectId(user.id),
        organizationId: user.organizationId
          ? new mongoose.Types.ObjectId(user.organizationId)
          : null,
        role: user.role,
      });
      if (Object.keys(accessFilter).length > 0) {
        andFilters.push(accessFilter);
      }
    }

    if (author === 'self' && session?.user?.id) {
      andFilters.push({ author: new mongoose.Types.ObjectId(session.user.id) });
    }

    if (search) {
      const searchOr: Record<string, unknown>[] = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];

      const role = session?.user?.role;
      if (role === 'teacher' || role === 'admin' || role === 'superadmin') {
        const matchingAuthors = await User.find({ name: { $regex: search, $options: 'i' } })
          .select('_id')
          .lean();
        if (matchingAuthors.length > 0) {
          searchOr.push({
            author: { $in: matchingAuthors.map((entry) => entry._id) },
          });
        }
      }

      andFilters.push({ $or: searchOr });
    }

    const query: Record<string, unknown> = {};
    if (andFilters.length === 1) {
      Object.assign(query, andFilters[0]);
    } else if (andFilters.length > 1) {
      query.$and = andFilters;
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedBlogs = blogs.map((blog: any) => ({
      ...blog,
      _id: blog._id?.toString(),
      author: blog.author
        ? {
            ...blog.author,
            _id: blog.author._id?.toString(),
          }
        : blog.author,
    }));

    let stats: { total: number; published: number; draft: number } | undefined;
    if (includeStats && session?.user) {
      const statsAndFilters: Record<string, unknown>[] = [];

      const user = session.user as {
        id: string;
        organizationId?: string | null;
        role: 'student' | 'teacher' | 'admin' | 'superadmin';
      };
      const accessFilter = getAccessFilter({
        _id: new mongoose.Types.ObjectId(user.id),
        organizationId: user.organizationId
          ? new mongoose.Types.ObjectId(user.organizationId)
          : null,
        role: user.role,
      });
      if (Object.keys(accessFilter).length > 0) {
        statsAndFilters.push(accessFilter);
      }
      if (author === 'self') {
        statsAndFilters.push({ author: new mongoose.Types.ObjectId(user.id) });
      }

      const statsQuery: Record<string, unknown> = {};
      if (statsAndFilters.length === 1) {
        Object.assign(statsQuery, statsAndFilters[0]);
      } else if (statsAndFilters.length > 1) {
        statsQuery.$and = statsAndFilters;
      }

      const [statsTotal, statsPublished, statsDraft] = await Promise.all([
        Blog.countDocuments(statsQuery),
        Blog.countDocuments({ ...statsQuery, isPublished: true }),
        Blog.countDocuments({ ...statsQuery, isPublished: false }),
      ]);
      stats = { total: statsTotal, published: statsPublished, draft: statsDraft };
    }

    const responseData = {
      blogs: serializedBlogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      ...(stats ? { stats } : {}),
    };

    if (canUseCache) {
      await setCachedData(cacheKey, responseData, 300);
    }

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/blogs', logContext);
    return NextResponse.json({ message: 'Failed to fetch blogs' }, { status: 500 });
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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    logContext.userId = session.user.id;

    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    if (session.user.role !== 'teacher' && session.user.role !== 'admin') {
      logFailedRequest(403, 'POST', '/api/blogs', logContext);
      return NextResponse.json({ message: 'Only teachers can create blogs' }, { status: 403 });
    }

    const body = await req.json();

    const validationResult = createBlogSchema.safeParse(body);
    if (!validationResult.success) {
      logFailedRequest(400, 'POST', '/api/blogs', logContext, validationResult.error);
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, content, topic, language = 'en', isPublished = true } = validationResult.data;
    const sanitizedContent = sanitizeHtml(content);

    if (session.user.role === 'teacher') {
      const blogCount = await Blog.countDocuments({
        author: session.user.id,
      });

      const limitCheck = await checkTeacherLimit('blogs', blogCount, session.user.id);
      if (limitCheck) return limitCheck;
    }

    if (!['en', 'hi'].includes(language)) {
      logFailedRequest(400, 'POST', '/api/blogs', logContext, new Error('Invalid language'));
      return NextResponse.json({ message: 'Language must be either en or hi' }, { status: 400 });
    }

    await dbConnect();

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

    const orgKey = organizationId?.toString() || 'public';
    await invalidatePattern(`blogs:${orgKey}:*`);
    revalidateTag(`blogs:${orgKey}`);

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/blogs', logContext);
    return NextResponse.json({ message: 'Failed to create blog' }, { status: 500 });
  }
}
