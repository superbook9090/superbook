import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course, Lesson, Chapter } from '@/models';
import { updateLessonSchema } from '@/lib/validation';
import { deleteLessonRelatedData } from '@/lib/cascade/deleteRelated';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

// GET /api/lessons/[id] - Get lesson details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'GET', path: '/api/lessons/[id]' };
  try {
    await dbConnect();
    const { id } = await params;
    const lesson = await Lesson.findById(id).lean();
    if (!lesson) return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });

    return NextResponse.json(serialize(lesson));
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/lessons/[id]', logContext);
    return NextResponse.json({ message: 'Error fetching lesson' }, { status: 500 });
  }
}

// PATCH /api/lessons/[id] - Update lesson
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'PATCH', path: '/api/lessons/[id]' };
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const lesson = await Lesson.findById(id);
    if (!lesson) return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });

    const course = await Course.findById(lesson.course);
    if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

    const isOwner = course.instructor.toString() === session.user.id;
    const isStaff = ['admin', 'superadmin'].includes(session.user.role || '');
    if (!isOwner && !isStaff) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validation = updateLessonSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ message: 'Invalid input', errors: validation.error.issues }, { status: 400 });

    const previousChapterId = lesson.chapter.toString();
    const nextChapterId = validation.data.chapter;

    if (nextChapterId && nextChapterId !== previousChapterId) {
      const targetChapter = await Chapter.findOne({ _id: nextChapterId, course: lesson.course });
      if (!targetChapter) {
        return NextResponse.json({ message: 'Target topic not found' }, { status: 400 });
      }
      lesson.chapter = targetChapter._id;
    }

    const { chapter: _, ...rest } = validation.data;
    void _;
    Object.assign(lesson, rest);
    await lesson.save();

    if (nextChapterId && nextChapterId !== previousChapterId) {
      const [prevCount, nextCount] = await Promise.all([
        Lesson.countDocuments({ chapter: previousChapterId }),
        Lesson.countDocuments({ chapter: nextChapterId }),
      ]);
      await Promise.all([
        Chapter.findByIdAndUpdate(previousChapterId, { lessonCount: prevCount }),
        Chapter.findByIdAndUpdate(nextChapterId, { lessonCount: nextCount }),
      ]);
    }

    return NextResponse.json(serialize(lesson));
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/lessons/[id]', logContext);
    return NextResponse.json({ message: 'Error updating lesson' }, { status: 500 });
  }
}

// DELETE /api/lessons/[id] - Delete lesson
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'DELETE', path: '/api/lessons/[id]' };
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const lesson = await Lesson.findById(id);
    if (!lesson) return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });

    const course = await Course.findById(lesson.course);
    if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

    const isOwner = course.instructor.toString() === session.user.id;
    const isStaff = ['admin', 'superadmin'].includes(session.user.role || '');
    if (!isOwner && !isStaff) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const chapterId = lesson.chapter;
    await deleteLessonRelatedData([id]);
    await Lesson.findByIdAndDelete(id);

    // Update counts
    await Chapter.findByIdAndUpdate(chapterId, { $inc: { lessonCount: -1 } });
    await Course.findByIdAndUpdate(course._id, { $inc: { lessonCount: -1 } });

    return NextResponse.json({ message: 'Lesson deleted' });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/lessons/[id]', logContext);
    return NextResponse.json({ message: 'Error deleting lesson' }, { status: 500 });
  }
}
