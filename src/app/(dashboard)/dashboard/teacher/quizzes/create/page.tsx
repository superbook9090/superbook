// src/app/(dashboard)/dashboard/teacher/quizzes/create/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CreateQuizForm from '@/components/dashboard/CreateQuizForm';

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
        <h1 className="text-2xl font-bold text-gray-900">Create New Quiz</h1>
        <p className="mt-2 text-gray-600">
          Create a quiz for one of your courses.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <CreateQuizForm />
        </div>
      </div>
    </div>
  );
}
