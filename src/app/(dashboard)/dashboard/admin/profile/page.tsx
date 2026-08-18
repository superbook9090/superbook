import { ROUTES } from '@/constants/routes';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { LazyProfile } from '@/lib/lazy';
import { getDashboardHomePath, isAdmin } from '@/lib/roles';

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.login);
  }

  if (!isAdmin(session.user?.role)) {
    redirect(getDashboardHomePath(session.user?.role));
  }

  return <LazyProfile session={session} descriptionKey="adminProfileDesc" />;
}
