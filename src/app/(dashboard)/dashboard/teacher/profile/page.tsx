// src/app/(dashboard)/dashboard/teacher/profile/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Profile from '@/components/dashboard/Profile';

export default async function TeacherProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
    redirect('/dashboard/student');
  }

  return <Profile session={session} descriptionKey="teacherProfileDesc" />;
}
