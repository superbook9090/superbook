// src/app/(dashboard)/dashboard/quizzes/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Quizzes from '@/features/dashboard/components/Quizzes';

export default async function QuizzesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <Quizzes />;
}
