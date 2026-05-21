import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Lesson from '@/models/Lesson';
import dbConnect from '@/lib/db';
import { logApiError } from '@/lib/logger';
import { isAdmin } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find all lessons that have youtubeVideoId populated
    const lessons = await Lesson.find({
      youtubeVideoId: { $exists: true, $ne: null, $not: /^\s*$/ }
    })
      .populate('uploadedBy', 'name email')
      .populate('course', 'title')
      .populate('chapter', 'title')
      .sort({ uploadedAt: -1 })
      .lean();

    return NextResponse.json({ videos: lessons });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/admin/videos');
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
