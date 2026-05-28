import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@/constants/routes';
import LoginForm from '@/features/auth/components/LoginForm';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(ROUTES.dashboard);
  }

  return <LoginForm />;
}