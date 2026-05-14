import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CreateQuizPageContent from '@/features/quizzes/components/CreateQuizPageContent';

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
    redirect('/dashboard/student');
  }

  const { id } = await params;
  return <CreateQuizPageContent quizId={id} />;
}
