import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

// GET /api/blogs - Get all published blogs
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const query: { isPublished: boolean; topic?: string } = { isPublished: true };
    if (topic) {
      query.topic = topic;
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

    const { title, content, topic, isPublished = true } = await req.json();

    if (!title || !content || !topic) {
      return NextResponse.json(
        { message: 'Title, content, and topic are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const blog = await Blog.create({
      title,
      content,
      topic,
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
