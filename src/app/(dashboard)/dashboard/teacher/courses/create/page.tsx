// src/app/(dashboard)/dashboard/teacher/courses/create/page.tsx
import { ROUTES } from '@/constants/routes';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { LazyCreateCoursePageContent } from '@/lib/lazy';
import { isStaffRole } from '@/lib/roles';

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  if (!isStaffRole(session.user?.role)) {
    redirect(ROUTES.student.root);
  }

  return <LazyCreateCoursePageContent />;
}
