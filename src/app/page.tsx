import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import MarketingHeader from '@/components/home/MarketingHeader';
import HeroStatic from '@/components/home/HeroStatic';
import HomeBelowFold from '@/components/home/HomeBelowFold';
import HomeQuizMakerSeo from '@/components/home/HomeQuizMakerSeo';
import FeaturedBlogs from '@/components/home/FeaturedBlogs';
import SeoResources from '@/components/home/SeoResources';
import MobileWebviewGuard from '@/components/mobile/MobileWebviewGuard';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
  title: 'Free Quiz Maker Online | Create Gamified Quizzes & Mock Tests',
  description:
    'Quiz Do is the best free online quiz maker for teachers and students. Create timed quizzes, mock exams, and engaging test series in minutes. Start for free.',
  path: '/',
  keywords: [
    'quiz',
    'free quiz maker',
    'quiz maker',
    'online quiz maker',
    'quiz maker free',
    'create quiz online',
    'free online quiz',
    'quiz creator',
    'MCQ quiz maker',
    'mock test maker',
    'quiz platform India',
    'online testing platform',
    'exam creation software',
    'test maker',
    'online assessment tool',
    'free exam builder',
    'create mock tests online',
    'MCQ generator',
    'test series platform',
    'teacher assessment tools',
    'student evaluation software',
    'custom quiz builder',
    'online exam system',
    'digital assessment platform',
  ],
});

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <MobileWebviewGuard />
      <JsonLd includeWebSite />
      <HeroStatic />
      <MarketingHeader />
      <HomeQuizMakerSeo />
      <SeoResources />
      <FeaturedBlogs />
      <HomeBelowFold />
    </main>
  );
}
