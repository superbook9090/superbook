import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import MarketingHeader from '@/components/home/MarketingHeader';
import HeroStatic from '@/components/home/HeroStatic';
import HomeBelowFold from '@/components/home/HomeBelowFold';
import HomeQuizMakerSeo from '@/components/home/HomeQuizMakerSeo';
import FeaturedBlogs from '@/components/home/FeaturedBlogs';
import SeoResources from '@/components/home/SeoResources';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Free Quiz Maker Online | Create Quizzes, MCQs & Mock Tests',
  description:
    'Quiz-Do is a free online quiz maker for teachers and students. Create quizzes, MCQ tests, mock exams, and test series in minutes. No credit card — start free today.',
  path: '/',
  keywords: [
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
  ],
});

export default function HomePage() {
  return (
    <main className="min-h-screen">
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
