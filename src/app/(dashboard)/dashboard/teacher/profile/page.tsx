// src/app/(dashboard)/dashboard/teacher/profile/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Profile from '@/features/dashboard/components/Profile';

import { getDashboardHomePath, isAdmin, normalizeRole } from '@/lib/roles';

export default async function TeacherProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const role = normalizeRole(session.user?.role);

  if (isAdmin(role)) {
    redirect('/dashboard/admin/profile');
  }

  if (role !== 'teacher') {
    redirect(getDashboardHomePath(role));
  }

  return <Profile session={session} descriptionKey="teacherProfileDesc" />;
}
