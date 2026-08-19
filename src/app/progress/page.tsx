// src/app/progress/page.tsx — top-level role-aware progress entrypoint
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@/constants/routes';
import { normalizeRole } from '@/lib/roles';

export default async function ProgressRoutePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`${ROUTES.login}?callbackUrl=${encodeURIComponent(ROUTES.progress)}`);
  }

  const role = normalizeRole(session.user.role);

  if (role === 'teacher') {
    redirect(ROUTES.teacher.progress);
  }

  if (role === 'admin' || role === 'superadmin') {
    redirect(ROUTES.admin.progress);
  }

  redirect(ROUTES.student.progress);
}
