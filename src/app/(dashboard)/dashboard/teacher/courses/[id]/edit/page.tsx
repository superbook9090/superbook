import { ROUTES } from '@/constants/routes';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import EditCoursePageContent from '@/features/courses/components/EditCoursePageContent';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
    redirect(ROUTES.student.root);
  }

  const { id } = await params;
  return <EditCoursePageContent courseId={id} />;
}
