// src/app/(dashboard)/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import { ROUTES } from '@/constants/routes';
import { getDashboardHomePath } from '@/lib/roles';

export default async function DashboardRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  const targetPath = getDashboardHomePath(session.user?.role);

  // 🛑 SAFETY CHECK (prevents infinite loop)
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  if (pathname === targetPath) {
    return null;
  }

  redirect(targetPath);
}
