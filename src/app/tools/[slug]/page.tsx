import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SEO_TOOLS_DATA } from '@/data/seo-tools';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { buildSeoLandingMetadata } from '@/lib/seo/landing-metadata';
import { getCanonicalSeoPath, getSeoLandingByPath } from '@/lib/seo/landing-routes';

export async function generateStaticParams() {
  return Object.keys(SEO_TOOLS_DATA).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = SEO_TOOLS_DATA[slug];
  if (!tool) return {};

  const canonicalPath = getCanonicalSeoPath(slug) ?? `/tools/${slug}`;
  return buildSeoLandingMetadata(tool, canonicalPath);
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = SEO_TOOLS_DATA[slug];

  if (!tool) {
    notFound();
  }

  const canonicalPath = getCanonicalSeoPath(slug);
  if (canonicalPath) {
    redirect(canonicalPath);
  }

  const route = getSeoLandingByPath(`/tools/${slug}`) ?? {
    path: `/tools/${slug}`,
    toolSlug: slug,
    label: tool.h1,
  };

  return <SeoLandingPage route={route} />;
}
