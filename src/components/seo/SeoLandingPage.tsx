import { notFound } from 'next/navigation';
import ToolClient from '@/app/tools/[slug]/ToolClient';
import {
  buildSeoLandingJsonLd,
  resolveSeoTool,
} from '@/lib/seo/landing-metadata';
import type { SeoLandingRoute } from '@/lib/seo/landing-routes';

type SeoLandingPageProps = {
  route: SeoLandingRoute;
};

export default function SeoLandingPage({ route }: SeoLandingPageProps) {
  const tool = resolveSeoTool(route.toolSlug);
  if (!tool) notFound();

  const { faqSchema, breadcrumbSchema } = buildSeoLandingJsonLd(tool, route.path);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ToolClient tool={tool} />
    </>
  );
}
