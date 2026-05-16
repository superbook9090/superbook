import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course, Chapter, Lesson } from '@/models';
import { updateChapterSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

// PATCH /api/chapters/[id] - Update chapter
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'PATCH', path: '/api/chapters/[id]' };
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const chapter = await Chapter.findById(id);
    if (!chapter) return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });

    const course = await Course.findById(chapter.course);
    if (course.instructor.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validation = updateChapterSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ message: 'Invalid input', errors: validation.error.issues }, { status: 400 });

    Object.assign(chapter, validation.data);
    await chapter.save();

    return NextResponse.json(serialize(chapter));
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/chapters/[id]', logContext);
    return NextResponse.json({ message: 'Error updating chapter' }, { status: 500 });
  }
}

// DELETE /api/chapters/[id] - Delete chapter and its lessons
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'DELETE', path: '/api/chapters/[id]' };
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const chapter = await Chapter.findById(id);
    if (!chapter) return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });

    const course = await Course.findById(chapter.course);
    if (course.instructor.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const lessonCount = await Lesson.countDocuments({ chapter: id });
    
    // Delete all lessons in this chapter
    await Lesson.deleteMany({ chapter: id });
    await Chapter.findByIdAndDelete(id);

    // Update course counts
    await Course.findByIdAndUpdate(course._id, {
      $inc: { chapterCount: -1, lessonCount: -lessonCount }
    });

    return NextResponse.json({ message: 'Chapter deleted' });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/chapters/[id]', logContext);
    return NextResponse.json({ message: 'Error deleting chapter' }, { status: 500 });
  }
}
