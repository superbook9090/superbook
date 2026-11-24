import mongoose from 'mongoose';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Quiz from '@/models/Quiz';
import CourseDoubt from '@/models/CourseDoubt';
import CourseGenerationProgress from '@/models/CourseGenerationProgress';
import '@/models/User';
import { deleteCourseRelatedData } from '@/lib/cascade/deleteRelated';
import { sendCourseDeletionEmail } from '@/lib/email';
import { invalidatePattern } from '@/lib/redis';

export const INACTIVE_COURSE_MIN_AGE_DAYS = 10;
export const INACTIVE_CLEANUP_MIN_DAYS = 1;
export const INACTIVE_CLEANUP_MAX_DAYS = 3650;

export function parseCleanupDays(raw: unknown, fallback = INACTIVE_COURSE_MIN_AGE_DAYS): number | null {
  if (raw === undefined || raw === null || raw === '') return fallback;
  const num = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(num) || num < INACTIVE_CLEANUP_MIN_DAYS || num > INACTIVE_CLEANUP_MAX_DAYS) {
    return null;
  }
  return num;
}

export const INACTIVE_COURSE_REMOVAL_EMAIL_MESSAGE =
  'We have reviewed your course and have decided to remove it from our platform due to insufficient content and a lack of activity, such as student enrollments or regular updates.\n\nYou are welcome to resubmit the course once it has been updated with more comprehensive content and is actively maintained.';

export interface InactiveCourseCandidate {
  _id: string;
  title: string;
  category: string;
  isPublished: boolean;
  lessonCount: number;
  chapterCount: number;
  quizzes: Array<{ _id: string; title: string }>;
  organizationId: string | null;
  createdAt: string;
  ageDays: number;
  instructor: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface PopulatedInstructorDoc {
  _id: { toString(): string };
  name?: string;
  email?: string;
  role?: string;
}

interface RawCourseDoc {
  _id: mongoose.Types.ObjectId;
  title: string;
  category?: string;
  isPublished?: boolean;
  lessonCount?: number;
  chapterCount?: number;
  organizationId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  instructor?: PopulatedInstructorDoc | mongoose.Types.ObjectId | null;
}

export async function findInactiveZeroEnrollmentCourses(
  onlyCourseIds?: string[],
  minAgeDays = INACTIVE_COURSE_MIN_AGE_DAYS
): Promise<{ courses: InactiveCourseCandidate[]; cutoffDate: Date; minAgeDays: number }> {
  await dbConnect();

  const resolvedDays = parseCleanupDays(minAgeDays) ?? INACTIVE_COURSE_MIN_AGE_DAYS;
  const nowMs = Date.now();
  const cutoffDate = new Date(nowMs - resolvedDays * 24 * 60 * 60 * 1000);

  const filter: Record<string, unknown> = {
    createdAt: { $lt: cutoffDate },
  };

  if (Array.isArray(onlyCourseIds)) {
    const validIds = onlyCourseIds
      .filter((id) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    if (validIds.length === 0) {
      return { courses: [], cutoffDate, minAgeDays: resolvedDays };
    }
    filter._id = { $in: validIds };
  }

  const oldCourses = (await Course.find(filter)
    .select('_id title category isPublished lessonCount chapterCount organizationId createdAt instructor')
    .populate('instructor', 'name email role')
    .sort({ createdAt: 1 })
    .lean()) as unknown as RawCourseDoc[];

  if (oldCourses.length === 0) {
    return { courses: [], cutoffDate, minAgeDays: resolvedDays };
  }

  // Authoritative check directly against the Enrollment collection (never trust denormalized enrolledCount alone)
  const candidateIds = oldCourses.map((c) => c._id);
  const enrolledIdsRaw = await Enrollment.distinct('course', {
    course: { $in: candidateIds },
  });
  const enrolledIdSet = new Set(enrolledIdsRaw.map((id) => String(id)));

  // Fetch quizzes belonging to eligible zero-enrollment courses so preview lists every quiz that will also be deleted
  const eligibleCourseIds = oldCourses
    .filter((c) => !enrolledIdSet.has(c._id.toString()))
    .map((c) => c._id);

  const courseQuizzesRaw =
    eligibleCourseIds.length > 0
      ? ((await Quiz.find({ course: { $in: eligibleCourseIds } })
          .select('_id title course')
          .lean()) as unknown as Array<{
          _id: mongoose.Types.ObjectId;
          title: string;
          course: mongoose.Types.ObjectId;
        }>)
      : [];

  const quizzesByCourseId = new Map<string, Array<{ _id: string; title: string }>>();
  for (const q of courseQuizzesRaw) {
    const cId = q.course.toString();
    const list = quizzesByCourseId.get(cId) || [];
    list.push({ _id: q._id.toString(), title: q.title });
    quizzesByCourseId.set(cId, list);
  }

  const zeroEnrollmentCourses: InactiveCourseCandidate[] = [];

  for (const course of oldCourses) {
    const idStr = course._id.toString();
    if (enrolledIdSet.has(idStr)) continue;

    const createdMs = new Date(course.createdAt).getTime();
    const ageDays = Math.floor((nowMs - createdMs) / (24 * 60 * 60 * 1000));

    const rawInstructor = course.instructor;
    const isPopulated =
      rawInstructor &&
      typeof rawInstructor === 'object' &&
      '_id' in rawInstructor &&
      ('email' in rawInstructor || 'name' in rawInstructor);

    const instructor = isPopulated
      ? {
          _id: (rawInstructor as PopulatedInstructorDoc)._id.toString(),
          name: (rawInstructor as PopulatedInstructorDoc).name || 'Teacher',
          email: (rawInstructor as PopulatedInstructorDoc).email || '',
          role: (rawInstructor as PopulatedInstructorDoc).role || 'teacher',
        }
      : null;

    zeroEnrollmentCourses.push({
      _id: idStr,
      title: course.title,
      category: course.category || '',
      isPublished: Boolean(course.isPublished),
      lessonCount: course.lessonCount ?? 0,
      chapterCount: course.chapterCount ?? 0,
      quizzes: quizzesByCourseId.get(idStr) || [],
      organizationId: course.organizationId ? course.organizationId.toString() : null,
      createdAt: new Date(course.createdAt).toISOString(),
      ageDays,
      instructor,
    });
  }

  return { courses: zeroEnrollmentCourses, cutoffDate, minAgeDays: resolvedDays };
}

export interface CleanupExecutionResult {
  deletedCount: number;
  skippedCount: number;
  emailsSent: number;
  emailsFailed: number;
  emailsSkipped: number;
  minAgeDays: number;
  deletedCourses: Array<{ _id: string; title: string; instructorEmail: string | null }>;
}

export async function cleanupInactiveZeroEnrollmentCourses(params: {
  deletedBy: string;
  courseIds?: string[];
  minAgeDays?: number;
}): Promise<CleanupExecutionResult> {
  const { courses, cutoffDate, minAgeDays } = await findInactiveZeroEnrollmentCourses(
    params.courseIds,
    params.minAgeDays
  );

  const deletedCourses: Array<{ _id: string; title: string; instructorEmail: string | null }> = [];
  const affectedOrgIds = new Set<string>();
  let skippedCount = 0;

  // Group deleted courses by instructor email so each instructor gets one clean email
  const emailGroups = new Map<
    string,
    { to: string; teacherName: string; courseTitles: string[] }
  >();
  let emailsSkipped = 0;

  for (const candidate of courses) {
    // Re-verify live enrollment count and age right before deleting (TOCTOU protection)
    const [liveEnrollmentCount, liveCourse] = await Promise.all([
      Enrollment.countDocuments({ course: candidate._id }),
      Course.findById(candidate._id).select('_id createdAt organizationId').lean<{
        _id: mongoose.Types.ObjectId;
        createdAt: Date;
        organizationId?: mongoose.Types.ObjectId | null;
      }>(),
    ]);

    if (
      !liveCourse ||
      liveEnrollmentCount > 0 ||
      new Date(liveCourse.createdAt).getTime() >= cutoffDate.getTime()
    ) {
      skippedCount += 1;
      continue;
    }

    await deleteCourseRelatedData(candidate._id);
    await Promise.all([
      CourseDoubt.deleteMany({ courseId: candidate._id }),
      CourseGenerationProgress.deleteMany({ course: candidate._id }),
    ]);
    await Course.findByIdAndDelete(candidate._id);

    const orgId = liveCourse.organizationId?.toString() || 'public';
    affectedOrgIds.add(orgId);

    const email = candidate.instructor?.email?.trim() || '';
    deletedCourses.push({
      _id: candidate._id,
      title: candidate.title,
      instructorEmail: email || null,
    });

    if (email) {
      const key = email.toLowerCase();
      const existing = emailGroups.get(key);
      if (existing) {
        existing.courseTitles.push(candidate.title);
      } else {
        emailGroups.set(key, {
          to: email,
          teacherName: candidate.instructor?.name || 'Teacher',
          courseTitles: [candidate.title],
        });
      }
    } else {
      emailsSkipped += 1;
    }
  }

  // Invalidate Redis and Next.js caches for all affected organizations
  for (const orgId of affectedOrgIds) {
    await invalidatePattern(`courses:${orgId}:*`);
    await invalidatePattern(`quizzes:${orgId}:*`);
    try {
      revalidateTag(`courses:${orgId}`);
    } catch {
      // Safe fallback if revalidation context unavailable
    }
  }

  // Send one common removal email per unique instructor
  let emailsSent = 0;
  let emailsFailed = 0;

  for (const group of emailGroups.values()) {
    const formattedTitles = group.courseTitles.join(', ');
    const sent = await sendCourseDeletionEmail({
      to: group.to,
      teacherName: group.teacherName,
      courseTitle: formattedTitles,
      reason: INACTIVE_COURSE_REMOVAL_EMAIL_MESSAGE,
      deletedBy: params.deletedBy,
    });
    if (sent) {
      emailsSent += 1;
    } else {
      emailsFailed += 1;
    }
  }

  return {
    deletedCount: deletedCourses.length,
    skippedCount,
    emailsSent,
    emailsFailed,
    emailsSkipped,
    minAgeDays,
    deletedCourses,
  };
}
