import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@/constants/routes';
import { createPageMetadata } from '@/lib/seo/metadata';
import { LazyLoginForm } from '@/lib/lazy';
import { getSafeCallbackUrl } from '@/lib/callbackUrl';

export const metadata: Metadata = createPageMetadata({
  title: 'Login — Access Courses & Quizzes',
  description:
    'Sign in to Quiz-Do to continue your online learning: enrolled courses, quizzes, progress analytics, and teacher-created content.',
  path: ROUTES.login,
  keywords: ['student login LMS', 'teacher login', 'online course login'],
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    const { callbackUrl } = await searchParams;
    redirect(getSafeCallbackUrl(callbackUrl, ROUTES.dashboard));
  }

  return <LazyLoginForm />;
}