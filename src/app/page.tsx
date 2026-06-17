import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import MarketingHeader from '@/components/home/MarketingHeader';
import HeroStatic from '@/components/home/HeroStatic';
import HomeBelowFold from '@/components/home/HomeBelowFold';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Quiz-Do | Free Online Quizzes, Courses & Student Progress',
  description:
    'Take free online quizzes, enroll in structured courses, and track your progress with Quiz-Do. The complete educational platform for interactive tests, mock exams, and online learning.',
  path: '/',
  keywords: [
    'free online quizzes',
    'online quiz platform',
    'take quizzes online',
    'practice tests',
    'course builder',
    'student dashboard',
    'online education app India',
    'quiz creator',
    'LMS with quizzes',
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
