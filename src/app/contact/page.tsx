import type { Metadata } from 'next';
import { LazyContactPage } from '@/lib/lazy';
import { ROUTES } from '@/constants/routes';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Contact Us — Education Platform Support',
  description:
    'Contact the Quiz Do team for LMS support, online course questions, partnership inquiries, and help with quizzes, student accounts, and teacher tools.',
  path: ROUTES.contact,
  keywords: ['LMS support', 'education platform contact', 'online learning help', 'teacher support'],
});

export default function ContactPage() {
  return <LazyContactPage />;
}
