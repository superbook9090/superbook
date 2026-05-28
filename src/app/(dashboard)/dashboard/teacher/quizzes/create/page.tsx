// src/app/(dashboard)/dashboard/teacher/quizzes/create/page.tsx
import { ROUTES } from '@/constants/routes';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { LazyCreateQuizPageContent } from '@/lib/lazy';

export default async function CreateQuizPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
    redirect(ROUTES.student.root);
  }

  return <LazyCreateQuizPageContent />;
}
