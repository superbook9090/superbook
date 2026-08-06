'use client';

import { use } from 'react';
import { ROUTES } from '@/constants/routes';
import EnrolledStudentsList from '@/components/courses/EnrolledStudentsList';

export default function TeacherCourseStudentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <EnrolledStudentsList courseId={id} backHref={ROUTES.teacher.courses} />;
}
