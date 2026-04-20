// src/app/(dashboard)/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function DashboardRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const role = session.user?.role;

  const targetPath =
    role === 'teacher'
      ? '/dashboard/teacher'
      : role === 'admin'
      ? '/dashboard/admin'
      : '/dashboard/student';

  // 🛑 SAFETY CHECK (prevents infinite loop)
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  if (pathname === targetPath) {
    return null;
  }

  redirect(targetPath);
}
