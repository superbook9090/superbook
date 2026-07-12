'use client';

import Link from 'next/link';
import { PRIMARY_SEO_LANDINGS } from '@/lib/seo/landing-routes';
import { useSeoTool } from '@/hooks/useSeoTool';

export function SeoLandingGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
      {PRIMARY_SEO_LANDINGS.map((landing) => (
        <SeoLandingGridItem key={landing.path} slug={landing.toolSlug} href={landing.path} />
      ))}
    </div>
  );
}

function SeoLandingGridItem({ slug, href }: { slug: string; href: string }) {
  const tool = useSeoTool(slug);
  if (!tool) return null;

  return (
    <Link
      href={href}
      className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] px-4 py-3 text-sm font-medium text-[var(--color-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors text-center"
    >
      {tool.h1}
    </Link>
  );
}
