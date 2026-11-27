import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { requireFeature } from '@/lib/settingsHelpers';
import mongoose from 'mongoose';
import { sanitizeHtml } from '@/lib/sanitize';
import { updateBlogSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { canManageOrgContent, validateContentAccess } from '@/lib/accessControl';
import { invalidatePattern } from '@/lib/redis';
import { revalidateTag } from 'next/cache';
import { slugifyBlogTitle } from '@/lib/blogs/public';

async function resolveSessionAccessUser(sessionUser: {
  id: string;
  role: string;
  organizationId?: string | null;
}) {
  let orgId =
    sessionUser.organizationId && mongoose.Types.ObjectId.isValid(sessionUser.organizationId)
      ? sessionUser.organizationId
      : null;

  if (sessionUser.role === 'admin' && !orgId && mongoose.Types.ObjectId.isValid(sessionUser.id)) {
    const dbUser = await User.findById(sessionUser.id)
      .select('organizationId')
      .lean<{ organizationId?: mongoose.Types.ObjectId | null }>();
    orgId = dbUser?.organizationId ? dbUser.organizationId.toString() : null;
  }

  return {
    _id: new mongoose.Types.ObjectId(sessionUser.id),
    organizationId: orgId ? new mongoose.Types.ObjectId(orgId) : null,
    role: sessionUser.role as 'student' | 'teacher' | 'admin' | 'superadmin',
  };
}

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

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const blog = await Blog.findOne(
      isObjectId ? { _id: id } : { slug: id.toLowerCase() }
    ).populate('author', 'name');

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);

    // Apply organization-based access control
    let accessUser: Awaited<ReturnType<typeof resolveSessionAccessUser>> | null = null;
    if (session?.user) {
      accessUser = await resolveSessionAccessUser(
        session.user as { id: string; role: string; organizationId?: string | null }
      );
      try {
        validateContentAccess(blog.organizationId, accessUser, 'blog');
      } catch {
        return NextResponse.json(
          { message: 'You do not have permission to access this blog' },
          { status: 403 }
        );
      }
    } else if (!publicBlogAccessAllowed(blog)) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    if (!blog.isPublished) {
      const authorId =
        typeof blog.author === 'object' && blog.author?._id
          ? blog.author._id.toString()
          : blog.author?.toString();
      if (!accessUser || !canManageOrgContent(blog.organizationId, authorId, accessUser)) {
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

    // Check ownership or same-organization admin access
    const accessUser = await resolveSessionAccessUser(
      session.user as { id: string; role: string; organizationId?: string | null }
    );
    if (!canManageOrgContent(blog.organizationId, blog.author, accessUser)) {
      return NextResponse.json(
        { message: 'You do not have permission to edit this blog' },
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
    if (slug !== undefined) {
      const cleanSlug = slug?.trim() ? slugifyBlogTitle(slug) : '';
      if (cleanSlug) {
        const existing = await Blog.findOne({
          slug: cleanSlug,
          _id: { $ne: blog._id },
        })
          .select('_id')
          .lean();

        if (existing) {
          return NextResponse.json(
            { message: 'This custom URL is already in use. Please choose a different one.' },
            { status: 400 }
          );
        }
        blog.slug = cleanSlug;
      } else if (blog.visibility === 'public') {
        blog.slug = await generateUniqueBlogSlug(title || blog.title, blog._id.toString());
      } else {
        blog.slug = undefined;
      }
    } else if (blog.visibility === 'public' && !blog.slug) {
      blog.slug = await generateUniqueBlogSlug(title || blog.title, blog._id.toString());
    } else if (blog.visibility !== 'public' && !blog.slug) {
      blog.isFeatured = false;
    }

    await blog.save();
    await blog.populate('author', 'name');

    // Invalidate cache for this organization
    const orgId = blog.organizationId?.toString() || 'public';
    await invalidatePattern(`blogs:*:${orgId}:*`);
    
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

    // Check ownership or same-organization admin access
    const accessUser = await resolveSessionAccessUser(
      session.user as { id: string; role: string; organizationId?: string | null }
    );
    if (!canManageOrgContent(blog.organizationId, blog.author, accessUser)) {
      return NextResponse.json(
        { message: 'You do not have permission to delete this blog' },
        { status: 403 }
      );
    }

    await Blog.findByIdAndDelete(id);

    // Invalidate cache for this organization
    const orgId = blog.organizationId?.toString() || 'public';
    await invalidatePattern(`blogs:*:${orgId}:*`);
    
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
