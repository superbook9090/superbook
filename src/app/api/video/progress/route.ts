import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import VideoProgress from '@/models/VideoProgress';
import LessonCompletion from '@/models/LessonCompletion';
import { Course, Lesson } from '@/models';
import { validateContentAccess, type AccessUser } from '@/lib/accessControl';
import { isStudentEnrolled } from '@/lib/courseAccess';
import dbConnect from '@/lib/db';
import { logApiError } from '@/lib/logger';
import { checkAndIssueCertificate } from '@/domain/learning/certificateIssuance';

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

    if (!mongoose.Types.ObjectId.isValid(lessonId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ message: 'Invalid parameters' }, { status: 400 });
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
    const { lessonId, courseId, watchTime, duration } = body;

    if (!lessonId || !courseId || watchTime === undefined || duration === undefined) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    if (
      typeof lessonId !== 'string' ||
      typeof courseId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(lessonId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return NextResponse.json({ message: 'Invalid courseId or lessonId' }, { status: 400 });
    }

    if (
      typeof watchTime !== 'number' ||
      !Number.isFinite(watchTime) ||
      watchTime < 0 ||
      typeof duration !== 'number' ||
      !Number.isFinite(duration) ||
      duration < 0
    ) {
      return NextResponse.json({ message: 'Invalid watchTime or duration' }, { status: 400 });
    }

    await dbConnect();

    const course = await Course.findById(courseId)
      .select('organizationId isPublished')
      .lean<{ organizationId?: mongoose.Types.ObjectId | null; isPublished?: boolean }>();
    if (!course || !course.isPublished) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const authUser: AccessUser = {
      _id: new mongoose.Types.ObjectId(user.id),
      organizationId: user.organizationId
        ? new mongoose.Types.ObjectId(user.organizationId)
        : null,
      role: (user.role || 'student') as AccessUser['role'],
    };

    try {
      validateContentAccess(course.organizationId, authUser, 'course');
    } catch {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const enrolled = await isStudentEnrolled(session.user.id, courseId);
    if (!enrolled) {
      return NextResponse.json(
        { message: 'You must be enrolled in this course to record progress' },
        { status: 403 }
      );
    }

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId })
      .select('_id isPublished')
      .lean<{ _id: mongoose.Types.ObjectId; isPublished?: boolean }>();
    if (!lesson || !lesson.isPublished) {
      return NextResponse.json({ message: 'Lesson not found in this course' }, { status: 404 });
    }

    const clampedWatchTime = duration > 0 ? Math.min(watchTime, duration) : watchTime;

    // Server-side completion threshold: require at least 90% watched with positive duration
    const meetsThreshold = duration > 0 && clampedWatchTime / duration >= 0.9;
    const existing = await VideoProgress.findOne({
      student: session.user.id,
      lesson: lessonId,
      course: courseId,
    })
      .select('completed')
      .lean<{ completed?: boolean }>();
    const isCompleted = Boolean(existing?.completed) || meetsThreshold;

    // Upsert VideoProgress
    const progress = await VideoProgress.findOneAndUpdate(
      { student: session.user.id, lesson: lessonId, course: courseId },
      {
        watchTime: clampedWatchTime,
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

      // Issue a certificate if this was the last requirement of a
      // teacher-completed course. Idempotent; never throws.
      await checkAndIssueCertificate(session.user.id, String(courseId));
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
