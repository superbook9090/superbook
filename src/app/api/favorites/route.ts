import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Favorite from '@/models/Favorite';
import Blog from '@/models/Blog'; // Import to ensure Blog model schema is registered for populate
import { createFavoriteSchema } from '@/lib/validation';
import { serialize } from '@/lib/serialize';

// GET /api/favorites - Get user's favorite blogs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    // Get user's favorites document (new format)
    const userFavorites = await Favorite.findOne({ user: session.user.id })
      .populate({
        path: 'blogs',
        match: { isPublished: true },
        populate: { path: 'author', select: 'name' },
        options: { sort: { createdAt: -1 } }
      });

    if (!userFavorites || !userFavorites.blogs || userFavorites.blogs.length === 0) {
      return NextResponse.json({
        favorites: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        }
      }, {
        headers: {
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    // Filter out null blogs (unpublished ones)
    const validBlogs = userFavorites.blogs.filter((blog: any) => blog !== null);

    // Apply pagination
    const paginatedBlogs = validBlogs.slice(skip, skip + limit);

    // Transform blogs array back to the old format for backward compatibility
    const transformedFavorites = paginatedBlogs.map((blog: any) => ({
      _id: blog._id.toString(),
      blog: {
        _id: blog._id.toString(),
        title: blog.title,
        topic: blog.topic,
        content: blog.content,
        createdAt: blog.createdAt,
        author: blog.author ? {
          name: blog.author.name
        } : null
      },
      createdAt: blog.createdAt,
    }));

    // Apply serialization to convert ObjectIds to strings
    const serializedFavorites = serialize(transformedFavorites);

    const total = validBlogs.length;

    return NextResponse.json({
      favorites: serializedFavorites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { message: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add blog to favorites
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate input using Zod schema
    const validationResult = createFavoriteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { blogId } = validationResult.data;

    await dbConnect();

    // Check if blog exists and is published
    const blog = await Blog.findOne({ _id: blogId, isPublished: true }).lean();
    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check if already favorited by looking at the blogs array
    const userFavorites = await Favorite.findOne({ user: session.user.id });
    
    if (userFavorites && userFavorites.blogs.some((blogId: any) => blogId.toString() === blogId)) {
      return NextResponse.json(
        { message: 'Already in favorites' },
        { status: 409 }
      );
    }

    // Use $addToSet to add the blog to user's favorites array with upsert
    const updatedFavorites = await Favorite.findOneAndUpdate(
      { user: session.user.id },
      { $addToSet: { blogs: blogId } },
      { upsert: true, new: true }
    ).populate({
      path: 'blogs',
      match: { _id: blogId },
      populate: { path: 'author', select: 'name' }
    });

    // Get the newly added blog
    const addedBlog = updatedFavorites.blogs?.find((blog: any) => 
      blog && blog._id.toString() === blogId
    );

    if (!addedBlog) {
      return NextResponse.json(
        { message: 'Failed to add favorite' },
        { status: 500 }
      );
    }

    // Transform to old format for backward compatibility
    const transformedFavorite = {
      _id: addedBlog._id.toString(),
      blog: {
        _id: addedBlog._id.toString(),
        title: addedBlog.title,
        topic: addedBlog.topic,
        content: addedBlog.content,
        createdAt: addedBlog.createdAt,
        author: addedBlog.author ? {
          name: addedBlog.author.name
        } : null
      },
      createdAt: updatedFavorites.updatedAt,
    };

    return NextResponse.json(transformedFavorite, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { message: 'Already in favorites' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}
