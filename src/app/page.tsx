import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import MarketingHeader from '@/components/home/MarketingHeader';
import HeroStatic from '@/components/home/HeroStatic';
import HomeBelowFold from '@/components/home/HomeBelowFold';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

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

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <JsonLd includeWebSite />
      <HeroStatic />
      <MarketingHeader />
      <HomeBelowFold />
    </main>
  );
}
