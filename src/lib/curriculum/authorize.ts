import type { Session } from 'next-auth';
import type { ICourse } from '@/models/Course';
import { Course } from '@/models';

type AuthResult =
  | { ok: true; course: ICourse }
  | { ok: false; status: number; message: string };

export async function authorizeCourseEditor(
  session: Session | null,
  courseId: string
): Promise<AuthResult> {
  if (!session?.user) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return { ok: false, status: 404, message: 'Course not found' };
  }

  const isOwner = course.instructor.toString() === session.user.id;
  const isStaff = ['admin', 'superadmin'].includes(session.user.role || '');

  if (!isOwner && !isStaff) {
    return { ok: false, status: 403, message: 'Forbidden' };
  }

  return { ok: true, course };
}

export async function authorizeCourseEditorByChapter(
  session: Session | null,
  chapterId: string
): Promise<AuthResult & { chapterId?: string }> {
  const { Chapter } = await import('@/models');
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    return { ok: false, status: 404, message: 'Chapter not found' };
  }

  const result = await authorizeCourseEditor(session, chapter.course.toString());
  if (!result.ok) return result;
  return { ...result, chapterId: String(chapter._id) };
}
