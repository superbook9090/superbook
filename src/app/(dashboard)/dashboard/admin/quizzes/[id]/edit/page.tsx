import { ROUTES } from '@/constants/routes';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { LazyCreateQuizPageContent } from '@/lib/lazy';
import { isStaffRole } from '@/lib/roles';

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  if (!isStaffRole(session.user?.role)) {
    redirect(ROUTES.student.root);
  }

  const { id } = await params;
  return <LazyCreateQuizPageContent quizId={id} />;
}
