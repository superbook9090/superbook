import type { Metadata } from 'next';
import { LazyPrivacyPage } from '@/lib/lazy';
import { ROUTES } from '@/constants/routes';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Privacy Policy — Student & Learning Data',
  description:
    'Read how Quiz-Do protects learner privacy on our education platform: account data, course progress, quiz results, and security practices for schools and students.',
  path: ROUTES.privacy,
  keywords: ['education privacy policy', 'student data protection', 'LMS security', 'FERPA-ready practices'],
});

export default function PrivacyPage() {
  return <LazyPrivacyPage />;
}
