import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course, Chapter, Lesson } from '@/models';
import { createLessonSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

// POST /api/chapters/[id]/lessons - Add a lesson to this chapter
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'POST', path: '/api/chapters/[id]/lessons' };
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
    const validation = createLessonSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ message: 'Invalid input', errors: validation.error.issues }, { status: 400 });

    // Determine order
    const lastLesson = await Lesson.findOne({ chapter: id }).sort({ order: -1 });
    const order = validation.data.order ?? (lastLesson ? lastLesson.order + 1 : 0);

    const lesson = await Lesson.create({
      ...validation.data,
      course: course._id,
      chapter: id,
      order,
    });

    // Update counts
    await Chapter.findByIdAndUpdate(id, { $inc: { lessonCount: 1 } });
    await Course.findByIdAndUpdate(course._id, { $inc: { lessonCount: 1 } });

    return NextResponse.json(serialize(lesson), { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/chapters/[id]/lessons', logContext);
    return NextResponse.json({ message: 'Error creating lesson' }, { status: 500 });
  }
}
