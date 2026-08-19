import type { Metadata } from 'next';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { buildSeoLandingMetadata, resolveSeoTool } from '@/lib/seo/landing-metadata';
import { getSeoLandingByPath } from '@/lib/seo/landing-routes';

const PATH = '/quizzes';
const route = getSeoLandingByPath(PATH)!;
const tool = resolveSeoTool(route.toolSlug)!;

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = buildSeoLandingMetadata(tool, PATH);

export default function QuizzesLandingPage() {
  return <SeoLandingPage route={route} />;
}
