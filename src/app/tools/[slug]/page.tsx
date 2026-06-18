import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEO_TOOLS_DATA } from '@/data/seo-tools';
import { getSiteUrl } from '@/lib/seo/config';
import ToolClient from './ToolClient';

export async function generateStaticParams() {
  return Object.keys(SEO_TOOLS_DATA).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const tool = SEO_TOOLS_DATA[resolvedParams.slug];
  if (!tool) {
    return {};
  }

  return {
    title: tool.title,
    description: tool.description,
    alternates: {
      canonical: `${getSiteUrl()}/tools/${tool.slug}`,
    },
    openGraph: {
      title: tool.title,
      description: tool.description,
      url: `${getSiteUrl()}/tools/${tool.slug}`,
      type: 'website',
      siteName: 'Quiz-Do',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.description,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tool = SEO_TOOLS_DATA[resolvedParams.slug];

  if (!tool) {
    notFound();
  }

  // Generate FAQ Schema
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

  // Generate Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: getSiteUrl(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${getSiteUrl()}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.title,
        item: `${getSiteUrl()}/tools/${tool.slug}`,
      },
    ],
  };

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
