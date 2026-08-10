import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@/constants/routes';
import { createPageMetadata } from '@/lib/seo/metadata';
import { LazyRegisterForm } from '@/lib/lazy';
import { getSafeCallbackUrl } from '@/lib/callbackUrl';

export const metadata: Metadata = createPageMetadata({
  title: 'Register — Free Online Learning Account',
  description:
    'Create a free Quiz Do account as a student or teacher. Join our education platform for online courses, quizzes, blogs, and learning analytics.',
  path: ROUTES.register,
  keywords: ['sign up LMS', 'free online learning', 'register as teacher', 'student registration'],
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    const { callbackUrl } = await searchParams;
    redirect(getSafeCallbackUrl(callbackUrl, ROUTES.dashboard));
  }

  return <LazyRegisterForm />;
}