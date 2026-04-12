// src/app/(dashboard)/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function DashboardRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Redirect based on user role
  const role = session.user?.role;

  if (role === 'teacher') {
    redirect('/dashboard/teacher');
  } else if (role === 'admin') {
    redirect('/dashboard/admin');
  } else {
    // Default to student dashboard
    redirect('/dashboard/student');
  }
}
