import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Favorite from '@/models/Favorite';
import mongoose from 'mongoose';

// DELETE /api/favorites/[id] - Remove blog from favorites
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    // The id can be either the favorite _id or the blog _id
    // We'll try to find by blog ID first
    let favorite;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      // Try to find by blog ID
      favorite = await Favorite.findOne({
        user: session.user.id,
        blog: id,
      });

      // If not found, try by favorite ID
      if (!favorite) {
        favorite = await Favorite.findOne({
          _id: id,
          user: session.user.id,
        });
      }
    }

    if (!favorite) {
      return NextResponse.json(
        { message: 'Favorite not found' },
        { status: 404 }
      );
    }

    await Favorite.findByIdAndDelete(favorite._id);

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { message: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
