// src/app/(dashboard)/dashboard/teacher/profile/page.tsx
import { ROUTES } from '@/constants/routes';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { LazyProfile } from '@/lib/lazy';

import { getDashboardHomePath, isAdmin, normalizeRole } from '@/lib/roles';

export default async function TeacherProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  const role = normalizeRole(session.user?.role);

  if (isAdmin(role)) {
    redirect(ROUTES.admin.profile);
  }

  if (role !== 'teacher') {
    redirect(getDashboardHomePath(role));
  }

  return <LazyProfile session={session} descriptionKey="teacherProfileDesc" />;
}
