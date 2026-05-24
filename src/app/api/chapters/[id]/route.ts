import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course, Chapter, Lesson } from '@/models';
import { updateChapterSchema } from '@/lib/validation';
import { authorizeCourseEditorByChapter } from '@/lib/curriculum/authorize';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

async function validateParentChapterUpdate(
  courseId: string,
  chapterId: string,
  parentChapterId: string | null | undefined
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (parentChapterId === undefined) return { ok: true };
  if (parentChapterId === chapterId) {
    return { ok: false, message: 'A topic cannot be its own parent' };
  }
  if (!parentChapterId) return { ok: true };

  const parent = await Chapter.findById(parentChapterId);
  if (!parent || parent.course.toString() !== courseId) {
    return { ok: false, message: 'Parent topic not found' };
  }
  if (parent.parentChapter) {
    return { ok: false, message: 'Maximum nesting depth is 2 levels (topic → sub-topic)' };
  }

  const hasSubTopics = await Chapter.exists({ parentChapter: chapterId });
  if (hasSubTopics) {
    return { ok: false, message: 'Topics with sub-topics cannot be nested under another topic' };
  }

  return { ok: true };
}

// PATCH /api/chapters/[id] - Update chapter
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'PATCH', path: '/api/chapters/[id]' };
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();
    const { id } = await params;

    const auth = await authorizeCourseEditorByChapter(session, id);
    if (!auth.ok) {
      return NextResponse.json({ message: auth.message }, { status: auth.status });
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });

    const body = await req.json();
    const validation = updateChapterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.issues },
        { status: 400 }
      );
    }

    if (validation.data.parentChapter !== undefined) {
      const parentCheck = await validateParentChapterUpdate(
        chapter.course.toString(),
        id,
        validation.data.parentChapter ?? null
      );
      if (!parentCheck.ok) {
        return NextResponse.json({ message: parentCheck.message }, { status: 400 });
      }
    }

    Object.assign(chapter, validation.data);
    await chapter.save();

    return NextResponse.json(serialize(chapter));
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/chapters/[id]', logContext);
    return NextResponse.json({ message: 'Error updating chapter' }, { status: 500 });
  }
}

// DELETE /api/chapters/[id] - Delete chapter, sub-topics, and lessons
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'DELETE', path: '/api/chapters/[id]' };
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();
    const { id } = await params;

    const auth = await authorizeCourseEditorByChapter(session, id);
    if (!auth.ok) {
      return NextResponse.json({ message: auth.message }, { status: auth.status });
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });

    const courseId = chapter.course;
    const subChapters = await Chapter.find({ parentChapter: id }).select('_id');
    const subChapterIds = subChapters.map((c) => c._id);

    const allChapterIds = [id, ...subChapterIds];
    const lessonCount = await Lesson.countDocuments({ chapter: { $in: allChapterIds } });

    await Lesson.deleteMany({ chapter: { $in: allChapterIds } });
    if (subChapterIds.length) {
      await Chapter.deleteMany({ _id: { $in: subChapterIds } });
    }
    await Chapter.findByIdAndDelete(id);

    await Course.findByIdAndUpdate(courseId, {
      $inc: {
        chapterCount: -(1 + subChapterIds.length),
        lessonCount: -lessonCount,
      },
    });

    return NextResponse.json({ message: 'Chapter deleted' });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/chapters/[id]', logContext);
    return NextResponse.json({ message: 'Error deleting chapter' }, { status: 500 });
  }
}
