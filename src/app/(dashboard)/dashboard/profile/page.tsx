// src/app/(dashboard)/dashboard/profile/page.tsx
import { ROUTES } from '@/constants/routes';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Profile from '@/features/dashboard/components/Profile';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  return <Profile session={session} />;
}
