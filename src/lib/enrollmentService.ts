import mongoose from 'mongoose';
import { revalidateTag } from 'next/cache';
import { Course, Enrollment } from '@/models';
import type { ICourse } from '@/models/Course';
import {
  isPrivateCourse,
  normalizeCourseCode,
  validateCourseCodeMatch,
} from '@/lib/courseAccess';
import { validateContentAccess, type AccessUser } from '@/lib/accessControl';
import { invalidatePattern } from '@/lib/redis';
import { serialize } from '@/lib/serialize';

type EnrollableCourse = Pick<ICourse, 'organizationId' | 'courseCode'> & {
  _id: mongoose.Types.ObjectId;
};

function buildAccessUser(studentId: string, organizationId?: string | null): AccessUser {
  return {
    _id: new mongoose.Types.ObjectId(studentId),
    organizationId: organizationId
      ? new mongoose.Types.ObjectId(organizationId)
      : null,
    role: 'student',
  };
}

function canAccessCourseOrg(
  course: { organizationId?: mongoose.Types.ObjectId | null },
  studentId: string,
  organizationId?: string | null
): boolean {
  try {
    validateContentAccess(course.organizationId, buildAccessUser(studentId, organizationId), 'course');
    return true;
  } catch {
    return false;
  }
}

export type EnrollStudentResult =
  | { ok: true; enrollment: unknown; created: boolean }
  | { ok: false; status: number; message: string };

export async function enrollStudentInCourse(options: {
  studentId: string;
  organizationId?: string | null;
  courseId: string;
  courseCode?: string;
}): Promise<EnrollStudentResult> {
  const { studentId, organizationId, courseId, courseCode } = options;

  const course = await Course.findOne({ _id: courseId, isPublished: true })
    .select('_id organizationId courseCode')
    .lean<EnrollableCourse>();
  if (!course) {
    return { ok: false, status: 404, message: 'Course not found or not published' };
  }

  if (!canAccessCourseOrg(course, studentId, organizationId)) {
    return { ok: false, status: 404, message: 'Course not found or not published' };
  }

  if (isPrivateCourse(course) && !validateCourseCodeMatch(course, courseCode)) {
    return { ok: false, status: 403, message: 'Invalid course code' };
  }

  const existing = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $ne: 'dropped' },
  }).lean();

  if (existing) {
    return {
      ok: false,
      status: 400,
      message: 'You are already enrolled in this course',
    };
  }

  const enrollment = await Enrollment.findOneAndUpdate(
    {
      student: studentId,
      course: courseId,
    },
    {
      $setOnInsert: {
        student: studentId,
        course: courseId,
        progress: 0,
        lessonCompletedCount: 0,
        enrolledAt: new Date(),
      },
      $set: {
        status: 'active',
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

  const wasExisting =
    enrollment?.enrolledAt &&
    new Date(enrollment.enrolledAt).getTime() < Date.now() - 5000;

  if (wasExisting) {
    return {
      ok: false,
      status: 400,
      message: 'You are already enrolled in this course',
    };
  }

  await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });

  const orgIdStr = organizationId
    ? new mongoose.Types.ObjectId(organizationId).toString()
    : 'public';

  await invalidatePattern(`courses:${orgIdStr}:*`);
  await invalidatePattern('enrollments:*');
  await invalidatePattern(`dashboard:${studentId}:*`);
  revalidateTag(`courses:${orgIdStr}`);
  revalidateTag('enrollments');

  return {
    ok: true,
    enrollment: serialize(enrollment),
    created: true,
  };
}

export async function findPublishedCourseByCode(
  courseCode: string
): Promise<EnrollableCourse | null> {
  const normalized = normalizeCourseCode(courseCode);
  return Course.findOne({
    courseCode: normalized,
    isPublished: true,
  })
    .select('_id organizationId courseCode')
    .lean<EnrollableCourse>();
}

export async function enrollStudentByCourseCode(options: {
  studentId: string;
  organizationId?: string | null;
  courseCode: string;
}): Promise<EnrollStudentResult> {
  const course = await findPublishedCourseByCode(options.courseCode);
  if (!course) {
    return { ok: false, status: 404, message: 'Invalid course code' };
  }

  return enrollStudentInCourse({
    studentId: options.studentId,
    organizationId: options.organizationId,
    courseId: course._id.toString(),
    courseCode: options.courseCode,
  });
}
