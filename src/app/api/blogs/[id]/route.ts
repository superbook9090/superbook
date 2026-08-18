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
import { slugifyBlogTitle } from '@/lib/blogs/public';
import { isAdmin } from '@/lib/roles';

function publicBlogAccessAllowed(blog: {
  visibility?: 'public' | 'organization' | null;
  organizationId?: mongoose.Types.ObjectId | null;
}) {
  return blog.visibility === 'public' || (!blog.visibility && !blog.organizationId);
}

async function generateUniqueBlogSlug(title: string, existingId: string) {
  const base = slugifyBlogTitle(title);
  let candidate = base;
  let count = 1;

  while (true) {
    const existing = await Blog.findOne({
      slug: candidate,
      _id: { $ne: new mongoose.Types.ObjectId(existingId) },
    })
      .select('_id')
      .lean();
    if (!existing) return candidate;
    count += 1;
    candidate = `${base}-${count}`;
  }
}

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function deriveExcerpt(content: string, explicit?: string | null) {
  if (explicit?.trim()) return explicit.trim();
  const plain = stripHtml(content);
  return plain.slice(0, 160).trim() + (plain.length > 160 ? '...' : '');
}

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
    } else if (!publicBlogAccessAllowed(blog)) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    if (!blog.isPublished) {
      if (!session || (session.user.id !== blog.author._id.toString() && !isAdmin(session.user.role))) {
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
    if (blog.author.toString() !== session.user.id && !isAdmin(session.user.role)) {
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

    const {
      title,
      content,
      topic,
      isPublished,
      slug,
      excerpt,
      metaTitle,
      metaDescription,
      visibility,
      isFeatured,
    } = validationResult.data;

    if (title) blog.title = title;
    if (content) blog.content = sanitizeHtml(content);
    if (topic) blog.topic = topic;
    if (typeof isPublished === 'boolean') blog.isPublished = isPublished;
    if (visibility) {
      blog.visibility = visibility;
    }
    if (typeof isFeatured === 'boolean') {
      blog.isFeatured = blog.visibility === 'public' ? isFeatured : false;
    }
    if (excerpt !== undefined) {
      blog.excerpt = excerpt?.trim() || deriveExcerpt(blog.content, null);
    } else if (content) {
      blog.excerpt = deriveExcerpt(blog.content, blog.excerpt);
    }
    if (metaTitle !== undefined) {
      blog.metaTitle = metaTitle?.trim() || blog.title;
    } else if (title) {
      blog.metaTitle = blog.title;
    }
    if (metaDescription !== undefined) {
      blog.metaDescription = metaDescription?.trim() || deriveExcerpt(blog.content, blog.excerpt);
    } else if (content) {
      blog.metaDescription = deriveExcerpt(blog.content, blog.excerpt);
    }
    if (blog.visibility === 'public') {
      if (slug !== undefined || title) {
        blog.slug = await generateUniqueBlogSlug(slug || blog.title, blog._id.toString());
      }
    } else {
      blog.slug = undefined;
      blog.isFeatured = false;
    }

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
    if (blog.author.toString() !== session.user.id && !isAdmin(session.user.role)) {
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
