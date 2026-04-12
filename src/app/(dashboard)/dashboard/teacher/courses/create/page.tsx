// src/app/(dashboard)/dashboard/teacher/courses/create/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CreateCourseForm from '@/components/dashboard/CreateCourseForm';

export default async function CreateCoursePage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
        <p className="mt-2 text-gray-600">
          Fill in the details below to create a new course.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <CreateCourseForm />
        </div>
      </div>
    </div>
  );
}
