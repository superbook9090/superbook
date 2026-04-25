import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { requireFeature } from '@/lib/settingsHelpers';
import mongoose from 'mongoose';
import { sanitizeHtml } from '@/lib/sanitize';
import { updateBlogSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { validateContentAccess } from '@/lib/accessControl';
import { invalidatePattern } from '@/lib/redis';
import { revalidateTag } from 'next/cache';

// GET /api/blogs/[id] - Get a single blog
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/blogs/[id]',
  };

  try {
    await dbConnect();

    // Check if blogs feature is enabled
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(id)
      .populate('author', 'name');

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);

    // Apply organization-based access control
    if (session?.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      validateContentAccess(
        blog.organizationId,
        {
          _id: new mongoose.Types.ObjectId(user.id),
          organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
          role: user.role as 'student' | 'teacher' | 'admin',
        },
        'blog'
      );
    }

    if (!blog.isPublished) {
      if (!session || (session.user.id !== blog.author._id.toString() && session.user.role !== 'admin')) {
        return NextResponse.json(
          { message: 'Blog not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(blog);
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/blogs/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// PATCH /api/blogs/[id] - Update a blog
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'PATCH',
    path: '/api/blogs/[id]',
  };

  try {
    await dbConnect();

    // Check if blogs feature is enabled
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    logContext.userId = session.user.id;

    // Check ownership
    if (blog.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'You can only edit your own blogs' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input using Zod schema
    const validationResult = updateBlogSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, content, topic, isPublished } = validationResult.data;

    if (title) blog.title = title;
    if (content) blog.content = sanitizeHtml(content);
    if (topic) blog.topic = topic;
    if (typeof isPublished === 'boolean') blog.isPublished = isPublished;

    await blog.save();
    await blog.populate('author', 'name');

    // Invalidate cache for this organization
    const orgId = blog.organizationId?.toString() || 'public';
    await invalidatePattern(`blogs:${orgId}:*`);
    
    // Revalidate Next.js cache tag
    revalidateTag(`blogs:${orgId}`);

    return NextResponse.json(blog);
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/blogs/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete a blog
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'DELETE',
    path: '/api/blogs/[id]',
  };

  try {
    await dbConnect();

    // Check if blogs feature is enabled
    const featureCheck = await requireFeature('enableBlogs');
    if (featureCheck) return featureCheck;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    logContext.userId = session.user.id;

    // Check ownership
    if (blog.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'You can only delete your own blogs' },
        { status: 403 }
      );
    }

    await Blog.findByIdAndDelete(id);

    // Invalidate cache for this organization
    const orgId = blog.organizationId?.toString() || 'public';
    await invalidatePattern(`blogs:${orgId}:*`);
    
    // Revalidate Next.js cache tag
    revalidateTag(`blogs:${orgId}`);

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/blogs/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
