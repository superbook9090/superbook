// src/app/(dashboard)/dashboard/quizzes/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function QuizzesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
      <p className="mt-2 text-gray-600">
        Take quizzes and view your results.
      </p>

      <div className="mt-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-gray-500">Quiz list will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
