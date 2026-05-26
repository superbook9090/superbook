import mongoose from 'mongoose';
import { Chapter, Lesson } from '@/models';

export type ResolvePlacementResult =
  | { ok: true; chapterId: mongoose.Types.ObjectId | null; lessonId: mongoose.Types.ObjectId | null }
  | { ok: false; message: string };

/**
 * Resolves quiz scope: course-level (both null), chapter/subtopic, or lesson.
 * Chapter and lesson are mutually exclusive.
 */
export async function resolveQuizPlacement(
  courseId: string,
  opts: {
    chapter?: string | null | undefined;
    lesson?: string | null | undefined;
  }
): Promise<ResolvePlacementResult> {
  const chapterRaw = opts.chapter;
  const lessonRaw = opts.lesson;

  const hasChapter =
    chapterRaw !== undefined && chapterRaw !== null && chapterRaw !== '';
  const hasLesson =
    lessonRaw !== undefined && lessonRaw !== null && lessonRaw !== '';

  if (hasChapter && hasLesson) {
    return { ok: false, message: 'Assign quiz to either a chapter or a lesson, not both' };
  }

  if (hasLesson) {
    const lessonId = String(lessonRaw);
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return { ok: false, message: 'Invalid lesson' };
    }

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId }).select('_id').lean();
    if (!lesson) {
      return { ok: false, message: 'Lesson not found in this course' };
    }

    return {
      ok: true,
      chapterId: null,
      lessonId: new mongoose.Types.ObjectId(lessonId),
    };
  }

  if (hasChapter) {
    const chapterId = String(chapterRaw);
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return { ok: false, message: 'Invalid chapter' };
    }

    const chapter = await Chapter.findOne({ _id: chapterId, course: courseId }).select('_id').lean();
    if (!chapter) {
      return { ok: false, message: 'Chapter not found in this course' };
    }

    return {
      ok: true,
      chapterId: new mongoose.Types.ObjectId(chapterId),
      lessonId: null,
    };
  }

  return { ok: true, chapterId: null, lessonId: null };
}
