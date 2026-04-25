// src/app/(dashboard)/dashboard/teacher/quizzes/create/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CreateQuizForm from '@/features/quizzes/components/CreateQuizForm';

export default async function CreateQuizPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
    redirect('/dashboard/student');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">Create New Quiz</h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
          Create a quiz for one of your courses.
        </p>
      </div>

      <div className="bg-[var(--card-solid)] shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <CreateQuizForm />
        </div>
      </div>
    </div>
  );
}
