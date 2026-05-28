// src/app/(dashboard)/dashboard/student/profile/page.tsx
import { ROUTES } from '@/constants/routes';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Profile from '@/features/dashboard/components/Profile';

import { isAdmin } from '@/lib/roles';

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  if (isAdmin(session.user?.role)) {
    redirect(ROUTES.admin.profile);
  }

  if (session.user?.role === 'teacher') {
    redirect(ROUTES.teacher.profile);
  }

  return <Profile session={session} />;
}
