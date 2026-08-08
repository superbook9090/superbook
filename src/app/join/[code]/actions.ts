'use server';

import { enrollStudentByCourseCode } from '@/lib/enrollmentService';

export async function joinCourseByCodeAction(
  studentId: string,
  organizationId: string | null,
  courseCode: string
) {
  return enrollStudentByCourseCode({ studentId, organizationId, courseCode });
}
