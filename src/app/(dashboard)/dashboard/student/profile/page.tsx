// src/app/(dashboard)/dashboard/student/profile/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role === 'teacher' || session.user?.role === 'admin') {
    redirect('/dashboard/teacher/profile');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <p className="mt-2 text-gray-600">
        Manage your account settings and preferences.
      </p>

      <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{session.user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{session.user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{session.user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
