import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import VideoProgress from '@/models/VideoProgress';
import LessonCompletion from '@/models/LessonCompletion';
import dbConnect from '@/lib/db';
import { logApiError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    const courseId = searchParams.get('courseId');

    if (!lessonId || !courseId) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    await dbConnect();
    const progress = await VideoProgress.findOne({
      student: session.user.id,
      lesson: lessonId,
      course: courseId,
    }).lean() as { watchTime: number; duration: number; completed: boolean } | null;

    if (!progress) {
      return NextResponse.json({ watchTime: 0, duration: 0, completed: false });
    }

    return NextResponse.json({
      watchTime: progress.watchTime,
      duration: progress.duration,
      completed: progress.completed,
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/video/progress');
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, courseId, watchTime, duration, completed } = body;

    if (!lessonId || !courseId || watchTime === undefined || duration === undefined) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    await dbConnect();

    // auto-mark as complete if client sends completed or student watched at least 90%
    const isCompleted = completed || (duration > 0 && watchTime / duration >= 0.9);

    // Upsert VideoProgress
    const progress = await VideoProgress.findOneAndUpdate(
      { student: session.user.id, lesson: lessonId, course: courseId },
      {
        watchTime,
        duration,
        completed: isCompleted,
        lastWatchedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // Synchronize with LessonCompletion
    if (isCompleted) {
      await LessonCompletion.findOneAndUpdate(
        { student: session.user.id, course: courseId, lesson: lessonId },
        { completedAt: new Date() },
        { upsert: true }
      );
    }

    return NextResponse.json({
      watchTime: progress.watchTime,
      duration: progress.duration,
      completed: progress.completed,
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/video/progress');
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
