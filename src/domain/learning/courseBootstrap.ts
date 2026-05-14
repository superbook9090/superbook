import type { Types } from 'mongoose';
import Chapter from '@/models/Chapter';
import Course from '@/models/Course';

/** Creates the first chapter for a new course and bumps `chapterCount`. */
export async function createDefaultChapter(courseId: Types.ObjectId): Promise<void> {
  await Chapter.create({
    course: courseId,
    title: 'Module 1',
    summary: '',
    order: 0,
    lessonCount: 0,
  });
  await Course.updateOne({ _id: courseId }, { $set: { chapterCount: 1 } });
}
