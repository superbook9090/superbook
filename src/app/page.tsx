import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Not logged in → redirect to login
  if (!session) {
    redirect('/login');
  }

  // Logged in → redirect to dashboard (which handles role-based routing)
  redirect('/dashboard');
}
