import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import HowItWorksClient from './HowItWorksClient';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = createPageMetadata({
  title: 'How Quiz Do Works — Create Quizzes & Online Courses',
  description:
    'Discover how to use Quiz Do to create interactive online quizzes, build custom courses with lessons and video lectures, enroll students, and track their test scores.',
  path: ROUTES.howItWorks,
  keywords: [
    'how to create online quizzes',
    'LMS guide',
    'interactive classroom tools',
    'quiz creator instructions',
    'student progress tracking tutorial',
    'online test maker help',
  ],
});

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
