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

  const { webAppSchema, howToSchema, faqSchema, breadcrumbSchema } = buildSeoLandingJsonLd(
    tool,
    route.path
  );

  return (
    <>
      <script
        id={`jsonld-webapp-${route.toolSlug}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        id={`jsonld-howto-${route.toolSlug}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        id={`jsonld-faq-${route.toolSlug}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        id={`jsonld-breadcrumb-${route.toolSlug}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ToolClient toolSlug={route.toolSlug} />
    </>
  );
}
