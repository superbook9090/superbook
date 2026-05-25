import mongoose from 'mongoose';
import { Enrollment } from '@/models';

/** Course is private when it has a non-empty course code. */
export function isPrivateCourse(course: { courseCode?: string | null }): boolean {
  return typeof course.courseCode === 'string' && course.courseCode.trim().length > 0;
}

export function normalizeCourseCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

/** Mongo filter: courses visible on public browse (no code required). */
export function publicCourseFilter() {
  return {
    $or: [
      { courseCode: { $exists: false } },
      { courseCode: null },
      { courseCode: '' },
    ],
  };
}

export async function isStudentEnrolled(
  studentId: string,
  courseId: string
): Promise<boolean> {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $ne: 'dropped' },
  })
    .select('_id')
    .lean();
  return !!enrollment;
}

export function canViewCourseCode(role?: string, isOwner?: boolean): boolean {
  return role === 'admin' || role === 'superadmin' || !!isOwner;
}

/** Strip course code from API payloads for unauthorized clients. */
export function sanitizeCourseResponse<T extends Record<string, unknown>>(
  course: T,
  options: { includeCourseCode?: boolean }
): T {
  if (options.includeCourseCode) {
    return {
      ...course,
      isPrivate: isPrivateCourse(course as { courseCode?: string | null }),
    };
  }
  const { courseCode: _courseCode, ...rest } = course;
  void _courseCode;
  return {
    ...rest,
    isPrivate: isPrivateCourse(course as { courseCode?: string | null }),
  } as unknown as T;
}

export function validateCourseCodeMatch(
  course: { courseCode?: string | null },
  submittedCode?: string | null
): boolean {
  if (!isPrivateCourse(course)) return true;
  if (!submittedCode?.trim()) return false;
  return normalizeCourseCode(submittedCode) === normalizeCourseCode(course.courseCode!);
}

export function resolveCourseCodeForSave(
  courseCode: string | null | undefined,
  existingCode?: string | null
): string | null {
  if (courseCode === null || courseCode === '') return null;
  if (courseCode === undefined) return existingCode ?? null;
  const normalized = normalizeCourseCode(courseCode);
  return normalized.length > 0 ? normalized : null;
}

export async function generateUniqueCourseCode(
  CourseModel: mongoose.Model<{ courseCode?: string | null }>,
  length = 8
): Promise<string> {
  const { generateInviteCode } = await import('@/lib/inviteCode');
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = generateInviteCode(length);
    const exists = await CourseModel.exists({ courseCode: code });
    if (!exists) return code;
  }
  throw new Error('Unable to generate unique course code');
}
