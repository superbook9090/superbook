import type { Metadata } from 'next';
import { SEO_TOOLS_DATA, type SeoToolData } from '@/data/seo-tools';
import { getSiteUrl } from '@/lib/seo/config';
import { createPageMetadata } from '@/lib/seo/metadata';

export function buildSeoLandingMetadata(tool: SeoToolData, canonicalPath: string): Metadata {
  const base = createPageMetadata({
    title: tool.title,
    description: tool.description,
    path: canonicalPath,
    keywords: [tool.h1, tool.h2, 'Quiz-Do', 'education', 'online learning'],
  });

  return {
    ...base,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'website',
      title: tool.title,
      description: tool.description,
      url: `${getSiteUrl()}${canonicalPath}`,
      siteName: 'Quiz-Do',
      images: ['/logo.svg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.description,
      images: ['/logo.svg'],
    },
  };
}

export function buildSeoLandingJsonLd(tool: SeoToolData, canonicalPath: string) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${canonicalPath}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${siteUrl}/tools` },
      { '@type': 'ListItem', position: 3, name: tool.h1, item: pageUrl },
    ],
  };

  return { faqSchema, breadcrumbSchema };
}

export function resolveSeoTool(toolSlug: string): SeoToolData | null {
  return SEO_TOOLS_DATA[toolSlug] ?? null;
}
