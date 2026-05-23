import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }
  return <ForgotPasswordForm />;
}
