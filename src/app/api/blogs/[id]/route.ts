import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { requireFeature } from '@/lib/settingsHelpers';
import mongoose from 'mongoose';

// GET /api/blogs/[id] - Get a single blog
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!blog.isPublished) {
      const session = await getServerSession(authOptions);
      if (!session || (session.user.id !== blog.author._id.toString() && session.user.role !== 'admin')) {
        return NextResponse.json(
          { message: 'Blog not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { message: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PATCH /api/blogs/[id] - Update a blog
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check ownership
    if (blog.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'You can only edit your own blogs' },
        { status: 403 }
      );
    }

    const { title, content, topic, isPublished } = await req.json();

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (topic) blog.topic = topic;
    if (typeof isPublished === 'boolean') blog.isPublished = isPublished;

    await blog.save();
    await blog.populate('author', 'name');

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { message: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete a blog
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check ownership
    if (blog.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'You can only delete your own blogs' },
        { status: 403 }
      );
    }

    await Blog.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { message: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
