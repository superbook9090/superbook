// src/app/(dashboard)/dashboard/student/profile/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Profile from '@/features/dashboard/components/Profile';

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role === 'teacher' || session.user?.role === 'admin') {
    redirect('/dashboard/teacher/profile');
  }

  return <Profile session={session} />;
}
