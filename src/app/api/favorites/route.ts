import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Favorite from '@/models/Favorite';
import Blog from '@/models/Blog';

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

    const favorites = await Favorite.find({ user: session.user.id })
      .populate({
        path: 'blog',
        match: { isPublished: true },
        populate: { path: 'author', select: 'name' },
      })
      .sort({ createdAt: -1 });

    // Filter out favorites where blog is null (unpublished)
    const validFavorites = favorites.filter(fav => fav.blog !== null);

    return NextResponse.json(validFavorites);
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

    const { blogId } = await req.json();

    if (!blogId) {
      return NextResponse.json(
        { message: 'Blog ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if blog exists and is published
    const blog = await Blog.findOne({ _id: blogId, isPublished: true });
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
    });

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
