import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@/constants/routes';
import { LazyForgotPasswordForm } from '@/lib/lazy';

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(ROUTES.dashboard);
  }
  return <LazyForgotPasswordForm />;
}
