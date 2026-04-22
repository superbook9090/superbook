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
    const fields = searchParams.get('fields'); // Comma-separated fields to select

    // Build select object for field selection
    let selectFields: Record<string, number> = {};
    if (fields) {
      const fieldList = fields.split(',');
      fieldList.forEach(f => selectFields[f] = 1);
    } else {
      // Default fields to avoid over-fetching
      selectFields = { createdAt: 1 };
    }

    const favorites = await Favorite.find({ user: session.user.id }, selectFields)
      .populate({
        path: 'blog',
        match: { isPublished: true },
        populate: { path: 'author', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter out favorites where blog is null (unpublished)
    const validFavorites = favorites.filter(fav => fav.blog !== null);

    // Apply serialization to convert ObjectIds to strings
    const serializedFavorites = serialize(validFavorites);

    const total = await Favorite.countDocuments({ user: session.user.id });

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

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: session.user.id,
      blog: blogId,
    }).lean();

    if (existingFavorite) {
      return NextResponse.json(
        { message: 'Already in favorites' },
        { status: 409 }
      );
    }

    const favorite = await Favorite.create({
      user: session.user.id,
      blog: blogId,
    });

    await favorite.populate({
      path: 'blog',
      populate: { path: 'author', select: 'name' },
    });

    return NextResponse.json(favorite, { status: 201 });
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
