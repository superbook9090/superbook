import { ROUTES } from '@/constants/routes';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { LazyEditCoursePageContent } from '@/lib/lazy';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  if (
    session.user?.role !== 'teacher' &&
    session.user?.role !== 'admin' &&
    session.user?.role !== 'superadmin'
  ) {
    redirect(ROUTES.student.root);
  }

  const { id } = await params;
  return <LazyEditCoursePageContent courseId={id} />;
}
