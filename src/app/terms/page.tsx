import type { Metadata } from 'next';
import TermsPageClient from '@/features/terms/components/TermsPageClient';
import { ROUTES } from '@/constants/routes';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Terms of Service — User Agreement & Policies',
  description:
    'Review the Quiz Do Terms of Service governing the use of online quizzes, course tools, educator materials, student accounts, and advertising disclaimers.',
  path: ROUTES.terms,
  keywords: ['terms of service', 'user agreement', 'quiz do terms', 'edtech policies'],
});

export default function TermsPage() {
  return <TermsPageClient />;
}
