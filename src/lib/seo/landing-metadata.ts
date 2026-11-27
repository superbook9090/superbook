import type { Metadata } from 'next';
import { SEO_TOOLS_DATA, type SeoToolData } from '@/data/seo-tools';
import { getSiteUrl } from '@/lib/seo/config';
import { createPageMetadata } from '@/lib/seo/metadata';

export function buildSeoLandingMetadata(tool: SeoToolData, canonicalPath: string): Metadata {
  const base = createPageMetadata({
    title: tool.title,
    description: tool.description,
    path: canonicalPath,
    keywords: [tool.h1, tool.h2, 'Quiz Do', 'education', 'online learning', 'India'],
    images: ['/og-image.png'],
  });

  return {
    ...base,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      title: tool.title,
      description: tool.description,
      url: `${getSiteUrl()}${canonicalPath}`,
      siteName: 'Quiz Do',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: tool.h1,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.description,
      images: ['/og-image.png'],
    },
  };
}

export function buildSeoLandingJsonLd(tool: SeoToolData, canonicalPath: string) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${canonicalPath}`;

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.h1,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web, Android',
    url: pageUrl,
    description: tool.description,
    inLanguage: ['en', 'hi'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    featureList: tool.features.map((f) => `${f.title}: ${f.description}`),
    publisher: {
      '@type': 'Organization',
      name: 'Quiz Do',
      url: siteUrl,
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: tool.h2,
    description: tool.intro,
    step: tool.howItWorks.map((s) => ({
      '@type': 'HowToStep',
      position: s.step,
      name: s.title,
      text: s.description,
    })),
  };

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

  return { webAppSchema, howToSchema, faqSchema, breadcrumbSchema };
}

export function resolveSeoTool(toolSlug: string): SeoToolData | null {
  return SEO_TOOLS_DATA[toolSlug] ?? null;
}
