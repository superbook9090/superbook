import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Chapter, Lesson } from '@/models';
import { ensureChapterIndexes } from '@/models/Chapter';
import { reorderCurriculumSchema } from '@/lib/validation';
import { authorizeCourseEditor } from '@/lib/curriculum/authorize';
import { logApiError, type LogContext } from '@/lib/logger';

// POST /api/courses/[id]/curriculum/reorder - Bulk reorder topics, sub-topics, and lessons
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'POST', path: '/api/courses/[id]/curriculum/reorder' };
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();
    await ensureChapterIndexes();
    const { id: courseId } = await params;

    const auth = await authorizeCourseEditor(session, courseId);
    if (!auth.ok) {
      return NextResponse.json({ message: auth.message }, { status: auth.status });
    }

    const body = await req.json();
    const validation = reorderCurriculumSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { chapters, lessons } = validation.data;
    if (!chapters?.length && !lessons?.length) {
      return NextResponse.json({ message: 'Nothing to reorder' }, { status: 400 });
    }

    if (chapters?.length) {
      const chapterIds = chapters.map((c) => c.id);
      const existing = await Chapter.find({ _id: { $in: chapterIds }, course: courseId }).select(
        '_id parentChapter'
      );
      if (existing.length !== chapterIds.length) {
        return NextResponse.json({ message: 'Invalid chapter in reorder payload' }, { status: 400 });
      }

      const chapterMap = new Map(existing.map((c) => [String(c._id), c]));

      for (const item of chapters) {
        if (item.parentChapter) {
          const parent = await Chapter.findOne({ _id: item.parentChapter, course: courseId });
          if (!parent) {
            return NextResponse.json({ message: 'Invalid parent topic' }, { status: 400 });
          }
          if (parent.parentChapter) {
            return NextResponse.json(
              { message: 'Maximum nesting depth is 2 levels (topic → sub-topic)' },
              { status: 400 }
            );
          }
        }

        const current = chapterMap.get(item.id);
        if (current?.parentChapter && !item.parentChapter) {
          // Promoting sub-topic to top-level is allowed
        }
      }

      const chapterOps = chapters.map((item) => ({
        updateOne: {
          filter: { _id: item.id, course: courseId },
          update: {
            $set: {
              order: item.order,
              parentChapter: item.parentChapter ?? null,
            },
          },
        },
      }));
      await Chapter.bulkWrite(chapterOps);
    }

    if (lessons?.length) {
      const lessonIds = lessons.map((l) => l.id);
      const existingLessons = await Lesson.find({ _id: { $in: lessonIds }, course: courseId }).select(
        '_id chapter'
      );
      if (existingLessons.length !== lessonIds.length) {
        return NextResponse.json({ message: 'Invalid lesson in reorder payload' }, { status: 400 });
      }

      const chapterIds = [...new Set(lessons.map((l) => l.chapterId))];
      const chaptersForLessons = await Chapter.find({ _id: { $in: chapterIds }, course: courseId });
      if (chaptersForLessons.length !== chapterIds.length) {
        return NextResponse.json({ message: 'Invalid target topic for lesson' }, { status: 400 });
      }

      const lessonOps = lessons.map((item) => ({
        updateOne: {
          filter: { _id: item.id, course: courseId },
          update: { $set: { order: item.order, chapter: item.chapterId } },
        },
      }));
      await Lesson.bulkWrite(lessonOps);

      // Recalculate lessonCount per affected chapter
      const affectedChapterIds = new Set([
        ...existingLessons.map((l) => l.chapter.toString()),
        ...lessons.map((l) => l.chapterId),
      ]);
      for (const chapterId of affectedChapterIds) {
        const count = await Lesson.countDocuments({ chapter: chapterId });
        await Chapter.findByIdAndUpdate(chapterId, { lessonCount: count });
      }
    }

    return NextResponse.json({ message: 'Curriculum reordered' });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/courses/[id]/curriculum/reorder', logContext);
    return NextResponse.json({ message: 'Error reordering curriculum' }, { status: 500 });
  }
}
