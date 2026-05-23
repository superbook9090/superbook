// src/app/(dashboard)/dashboard/student/profile/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Profile from '@/features/dashboard/components/Profile';

import { isAdmin } from '@/lib/roles';

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (isAdmin(session.user?.role)) {
    redirect('/dashboard/admin/profile');
  }

  if (session.user?.role === 'teacher') {
    redirect('/dashboard/teacher/profile');
  }

  return <Profile session={session} />;
}
