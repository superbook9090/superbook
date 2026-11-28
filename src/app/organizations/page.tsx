import type { Metadata } from 'next';
import OrganizationsLandingClient from '@/features/organizations/components/OrganizationsLandingClient';
import { ROUTES } from '@/constants/routes';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'For Organizations — Create Your Branded LMS Workspace | Quiz Do',
  description:
    'Launch a dedicated, branded LMS workspace for your school, coaching institute, or college on Quiz Do with isolated courses, quizzes, AI quiz generation, live contests, analytics, and separate student & teacher invite links.',
  path: ROUTES.organizations,
  keywords: [
    'LMS for coaching institutes',
    'school quiz platform India',
    'branded online test portal',
    'multi-tenant LMS India',
    'create organization Quiz Do',
  ],
});

export default function OrganizationsPage() {
  return <OrganizationsLandingClient />;
}
