import type { Metadata } from 'next';
import AboutPageClient from '@/features/about/components/AboutPageClient';
import { ROUTES } from '@/constants/routes';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'About Us — Mission, Educational Vision & Platform | Quiz Do',
  description:
    'Learn about Quiz Do, our mission to democratize interactive learning and test preparation for teachers and students across India with free quizzes, mock tests, and courses.',
  path: ROUTES.about,
  keywords: [
    'about quiz do',
    'educational technology India',
    'free quiz maker',
    'online test series platform',
    'quiz do mission',
  ],
});

export default function AboutPage() {
  return <AboutPageClient />;
}
