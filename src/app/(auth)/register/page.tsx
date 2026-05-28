import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@/constants/routes';
import RegisterForm from '@/features/auth/components/RegisterForm';

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(ROUTES.dashboard);
  }

  return <RegisterForm />;
}