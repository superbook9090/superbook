// src/app/(dashboard)/dashboard/quizzes/page.tsx
import { ROUTES } from '@/constants/routes';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { LazyQuizzesHub } from '@/lib/lazy';

export default async function QuizzesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  return <LazyQuizzesHub />;
}
