import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@/constants/routes';
import JsonLd from '@/components/seo/JsonLd';
import HomePageClient from '@/components/home/HomePageClient';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Online LMS for Courses, Quizzes & Learning Progress',
  description:
    'Learn smarter with Quiz-Do — an education platform and learning management system (LMS) for online courses, interactive quizzes, student progress tracking, and teacher-led classrooms. Free to start.',
  path: '/',
  keywords: [
    'learn online',
    'take quizzes online',
    'student dashboard',
    'create online courses',
    'education app India',
  ],
});

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(ROUTES.dashboard);
  }

  return (
    <main className="min-h-screen">
      <JsonLd includeWebSite />
      <HomePageClient />
    </main>
  );
}
