import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { requireFeature, checkTeacherLimit } from '@/lib/settingsHelpers';

// GET /api/blogs - Get all published blogs
export async function GET(req: NextRequest) {
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
      .skip((page - 1) * limit);

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
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog (teacher only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Check if blogs feature is enabled
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'teacher' && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only teachers can create blogs' },
        { status: 403 }
      );
    }

    const { title, content, topic, language = 'en', isPublished = true } = await req.json();

    if (!title || !content || !topic) {
      return NextResponse.json(
        { message: 'Title, content, and topic are required' },
        { status: 400 }
      );
    }

    // Check teacher limits (skip for admins)
    if (session.user.role === 'teacher') {
      const blogCount = await Blog.countDocuments({
        author: session.user.id,
      });

      const limitCheck = await checkTeacherLimit('blogs', blogCount);
      if (limitCheck) return limitCheck;
    }

    if (!['en', 'hi'].includes(language)) {
      return NextResponse.json(
        { message: 'Language must be either en or hi' },
        { status: 400 }
      );
    }

    await dbConnect();

    const blog = await Blog.create({
      title,
      content,
      topic,
      language,
      author: session.user.id,
      isPublished,
    });

    await blog.populate('author', 'name');

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { message: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
