// src/app/(dashboard)/dashboard/teacher/courses/create/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CreateCoursePageContent from '@/features/courses/components/CreateCoursePageContent';

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
    redirect('/dashboard/student');
  }

  return <CreateCoursePageContent />;
}
