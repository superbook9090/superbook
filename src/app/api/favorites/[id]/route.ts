import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Favorite from '@/models/Favorite';
import mongoose from 'mongoose';
import { logApiError, type LogContext } from '@/lib/logger';

// DELETE /api/favorites/[id] - Remove blog from favorites
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'DELETE',
    path: '/api/favorites/[id]',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    logContext.userId = session.user.id;

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Use $pull to remove the blog from user's favorites array
    const result = await Favorite.updateOne(
      { user: session.user.id },
      { $pull: { blogs: id } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'User favorites not found' },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Blog not in favorites' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/favorites/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
