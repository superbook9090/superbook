import crypto from 'crypto';
import { Types } from 'mongoose';
import '@/models';
import Course, { type ICourse } from '@/models/Course';
import Lesson from '@/models/Lesson';
import Quiz from '@/models/Quiz';
import LessonCompletion from '@/models/LessonCompletion';
import QuizAttempt from '@/models/QuizAttempt';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import Certificate from '@/models/Certificate';
import { createUserNotifications } from '@/lib/server/services/notifications-service';
import { sendPushNotification } from '@/lib/notifications/push/sendPushNotification';
import { generateCertificatePayload } from '@/lib/notifications/push/notificationPayload';
import { logError, logInfo } from '@/lib/logger';
import { invalidatePattern } from '@/lib/redis';

type CourseLean = Pick<ICourse, 'isCompleted' | 'title' | 'organizationId'> & {
  _id: Types.ObjectId;
  instructor: Types.ObjectId;
};

function generateCertificateSerial(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `QD-${year}-${random}`;
}

/** Published curriculum a student must finish before a certificate is issued. */
async function getCourseRequirements(courseId: string | Types.ObjectId) {
  const [lessonIds, quizIds] = await Promise.all([
    Lesson.find({ course: courseId, isPublished: true }).select('_id').lean(),
    Quiz.find({ course: courseId, isPublished: true }).select('_id').lean(),
  ]);
  return {
    lessonIds: lessonIds.map((l) => String(l._id)),
    quizIds: quizIds.map((q) => String(q._id)),
  };
}

async function hasStudentFinished(
  studentId: string,
  courseId: string | Types.ObjectId,
  requirements: { lessonIds: string[]; quizIds: string[] }
): Promise<boolean> {
  const { lessonIds, quizIds } = requirements;

  // A certificate for an empty course would be meaningless.
  if (lessonIds.length === 0 && quizIds.length === 0) return false;

  if (lessonIds.length > 0) {
    const completedLessons = await LessonCompletion.countDocuments({
      student: studentId,
      course: courseId,
      lesson: { $in: lessonIds },
    });
    if (completedLessons < lessonIds.length) return false;
  }

  if (quizIds.length > 0) {
    const completedQuizIds = await QuizAttempt.distinct('quiz', {
      student: studentId,
      course: courseId,
      quiz: { $in: quizIds },
      status: { $in: ['completed', 'force_submitted'] },
    });
    if (completedQuizIds.length < quizIds.length) return false;
  }

  return true;
}

async function createCertificateRecord(
  studentId: string,
  course: CourseLean
): Promise<{ certificateId: string; created: boolean } | null> {
  const existing = await Certificate.findOne({ student: studentId, course: course._id })
    .select('certificateId')
    .lean<{ certificateId: string }>();
  if (existing) return { certificateId: existing.certificateId, created: false };

  const [student, instructor] = await Promise.all([
    User.findById(studentId).select('name').lean<{ name?: string }>(),
    User.findById(course.instructor).select('name').lean<{ name?: string }>(),
  ]);
  if (!student) return null;

  try {
    const certificate = await Certificate.create({
      student: studentId,
      course: course._id,
      organizationId: course.organizationId ?? null,
      certificateId: generateCertificateSerial(),
      studentName: student.name || 'Student',
      courseTitle: course.title,
      instructorName: instructor?.name || '',
      issuedAt: new Date(),
    });
    return { certificateId: certificate.certificateId, created: true };
  } catch (error) {
    // Duplicate key: a concurrent request already issued it.
    if ((error as { code?: number }).code === 11000) {
      const raced = await Certificate.findOne({ student: studentId, course: course._id })
        .select('certificateId')
        .lean<{ certificateId: string }>();
      return raced ? { certificateId: raced.certificateId, created: false } : null;
    }
    throw error;
  }
}

async function markEnrollmentCompleted(studentId: string, courseId: Types.ObjectId): Promise<void> {
  await Enrollment.updateOne(
    { student: studentId, course: courseId, status: { $ne: 'dropped' } },
    { $set: { progress: 100, status: 'completed' }, $min: { completedAt: new Date() } },
    // $min sets completedAt only if the new date is earlier or the field is missing;
    // an existing earlier completion date is preserved.
  );
}

async function notifyCertificateIssued(
  studentIds: string[],
  course: CourseLean,
  certificateIdByStudent: Map<string, string>
): Promise<void> {
  for (const studentId of studentIds) {
    const certificateId = certificateIdByStudent.get(studentId);
    if (!certificateId) continue;
    const payload = generateCertificatePayload(course.title, certificateId, String(course._id));
    try {
      await createUserNotifications([studentId], payload);
      await sendPushNotification([studentId], payload);
    } catch (error) {
      // Notification failure must never roll back an issued certificate.
      logError('Certificate notification failed', { userId: studentId }, error);
    }
  }
}

/**
 * Issue a certificate to one student if all conditions hold:
 * teacher marked the course completed + student finished every published
 * lesson and quiz. Safe to call repeatedly (idempotent). Never throws.
 */
export async function checkAndIssueCertificate(studentId: string, courseId: string): Promise<void> {
  try {
    const course = await Course.findById(courseId)
      .select('isCompleted title instructor organizationId')
      .lean<CourseLean>();
    if (!course?.isCompleted) return;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: { $ne: 'dropped' },
    })
      .select('_id')
      .lean();
    if (!enrollment) return;

    const requirements = await getCourseRequirements(courseId);
    const finished = await hasStudentFinished(studentId, courseId, requirements);
    if (!finished) return;

    const result = await createCertificateRecord(studentId, course);
    if (!result?.created) return;

    await markEnrollmentCompleted(studentId, course._id);
    await notifyCertificateIssued(
      [studentId],
      course,
      new Map([[studentId, result.certificateId]])
    );
    await invalidatePattern(`dashboard:${studentId}:*`);
    logInfo(`Certificate issued for course ${courseId}`, { userId: studentId });
  } catch (error) {
    logError(`checkAndIssueCertificate failed for course ${courseId}`, { userId: studentId }, error);
  }
}

/**
 * Backfill pass when the teacher marks a course completed: issue certificates
 * to every enrolled student who already finished the curriculum. Never throws.
 */
export async function issueCertificatesForCourse(courseId: string): Promise<{ issued: number }> {
  let issued = 0;
  try {
    const course = await Course.findById(courseId)
      .select('isCompleted title instructor organizationId')
      .lean<CourseLean>();
    if (!course?.isCompleted) return { issued };

    const requirements = await getCourseRequirements(courseId);
    if (requirements.lessonIds.length === 0 && requirements.quizIds.length === 0) {
      return { issued };
    }

    const enrollments = await Enrollment.find({ course: courseId, status: { $ne: 'dropped' } })
      .select('student')
      .lean<{ student: Types.ObjectId }[]>();

    const certificateIdByStudent = new Map<string, string>();
    for (const enrollment of enrollments) {
      const studentId = String(enrollment.student);
      try {
        const finished = await hasStudentFinished(studentId, courseId, requirements);
        if (!finished) continue;

        const result = await createCertificateRecord(studentId, course);
        if (!result?.created) continue;

        await markEnrollmentCompleted(studentId, course._id);
        certificateIdByStudent.set(studentId, result.certificateId);
        issued++;
      } catch (error) {
        logError(`Certificate backfill failed for course ${courseId}`, { userId: studentId }, error);
      }
    }

    if (certificateIdByStudent.size > 0) {
      await notifyCertificateIssued([...certificateIdByStudent.keys()], course, certificateIdByStudent);
      logInfo(`Certificates backfilled for completed course ${courseId}`, undefined, { issued });
    }
  } catch (error) {
    logError(`issueCertificatesForCourse failed for course ${courseId}`, undefined, error);
  }
  return { issued };
}
