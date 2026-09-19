import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Lesson from '@/models/Lesson';
import Course from '@/models/Course';
import dbConnect from '@/lib/db';
import { logApiError } from '@/lib/logger';
import { isAdmin, isSuperAdmin } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const userRole = session.user.role;
    const organizationId = session.user.organizationId;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let courseIds: any[] = [];
    if (!isSuperAdmin(userRole) && organizationId) {
      const courses = await Course.find({ organizationId }).select('_id').lean();
      courseIds = courses.map((c) => c._id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchStage: any = {
      youtubeVideoId: { $exists: true, $ne: null, $type: 'string', $not: /^\s*$/ },
    };

    if (!isSuperAdmin(userRole) && organizationId) {
      matchStage.course = { $in: courseIds };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'uploadedBy',
        },
      },
      { $unwind: { path: '$uploadedBy', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { title: searchRegex },
            { 'course.title': searchRegex },
            { 'uploadedBy.name': searchRegex },
          ],
        },
      });
    }

    pipeline.push({ $sort: { uploadedAt: -1 } });

    pipeline.push({
      $facet: {
        metrics: [
          {
            $group: {
              _id: null,
              totalDuration: { $sum: '$duration' },
              uniqueCourses: { $addToSet: '$course._id' },
              totalVideos: { $sum: 1 },
            },
          },
        ],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const result = await Lesson.aggregate(pipeline);
    
    const metrics = result[0]?.metrics[0] || { totalDuration: 0, uniqueCourses: [], totalVideos: 0 };
    const videos = result[0]?.data || [];

    const stats = {
      totalDurationMinutes: Math.round((metrics.totalDuration || 0) / 60),
      uniqueCoursesCount: metrics.uniqueCourses.length,
      totalVideos: metrics.totalVideos || 0,
    };

    // Format videos to match the expected frontend interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedVideos = videos.map((v: any) => ({
      _id: String(v._id),
      title: v.title,
      youtubeVideoId: v.youtubeVideoId,
      videoEmbedUrl: v.videoEmbedUrl,
      thumbnail: v.thumbnail,
      duration: v.duration,
      course: v.course ? { title: v.course.title } : null,
      uploadedBy: v.uploadedBy ? { name: v.uploadedBy.name, email: v.uploadedBy.email } : null,
      uploadedAt: v.uploadedAt ? new Date(v.uploadedAt).toISOString() : undefined,
    }));

    return NextResponse.json({
      videos: formattedVideos,
      stats,
      pagination: {
        page,
        limit,
        total: stats.totalVideos,
        totalPages: Math.ceil(stats.totalVideos / limit),
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/admin/videos');
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
