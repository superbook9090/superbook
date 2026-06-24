import type { Metadata } from 'next';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { buildSeoLandingMetadata, resolveSeoTool } from '@/lib/seo/landing-metadata';
import { getSeoLandingByPath } from '@/lib/seo/landing-routes';

const PATH = '/lms-platform';
const route = getSeoLandingByPath(PATH)!;
const tool = resolveSeoTool(route.toolSlug)!;

export const dynamic = 'force-static';

export const metadata: Metadata = buildSeoLandingMetadata(tool, PATH);

export default function LmsPlatformPage() {
  return <SeoLandingPage route={route} />;
}
