import mongoose from 'mongoose';
import type { Session } from 'next-auth';
import type { ICourse } from '@/models/Course';
import { Course } from '@/models';
import { canManageOrgContent, type AccessUser } from '@/lib/accessControl';

type AuthResult =
  | { ok: true; course: ICourse }
  | { ok: false; status: number; message: string };

function toAccessUser(session: Session): AccessUser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;
  return {
    _id: new mongoose.Types.ObjectId(user.id),
    organizationId: user.organizationId
      ? new mongoose.Types.ObjectId(user.organizationId)
      : null,
    role: (user.role || 'student') as AccessUser['role'],
  };
}

export async function authorizeCourseEditor(
  session: Session | null,
  courseId: string
): Promise<AuthResult> {
  if (!session?.user) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return { ok: false, status: 404, message: 'Course not found' };
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return { ok: false, status: 404, message: 'Course not found' };
  }

  const authUser = toAccessUser(session);
  if (!canManageOrgContent(course.organizationId, course.instructor, authUser)) {
    return { ok: false, status: 403, message: 'Forbidden' };
  }

  return { ok: true, course };
}

export async function authorizeCourseEditorByChapter(
  session: Session | null,
  chapterId: string
): Promise<AuthResult & { chapterId?: string }> {
  if (!session?.user) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  if (!mongoose.Types.ObjectId.isValid(chapterId)) {
    return { ok: false, status: 404, message: 'Chapter not found' };
  }

  const { Chapter } = await import('@/models');
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    return { ok: false, status: 404, message: 'Chapter not found' };
  }

  const result = await authorizeCourseEditor(session, chapter.course.toString());
  if (!result.ok) return result;
  return { ...result, chapterId: String(chapter._id) };
}
