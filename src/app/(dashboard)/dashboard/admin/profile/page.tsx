import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Profile from '@/features/dashboard/components/Profile';
import { getDashboardHomePath, isAdmin } from '@/lib/roles';

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (!isAdmin(session.user?.role)) {
    redirect(getDashboardHomePath(session.user?.role));
  }

  return <Profile session={session} descriptionKey="manageAccount" />;
}
