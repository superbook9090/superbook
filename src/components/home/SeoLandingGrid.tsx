'use client';

import Link from 'next/link';
import { PRIMARY_SEO_LANDINGS } from '@/lib/seo/landing-routes';
import { useSeoTool } from '@/hooks/useSeoTool';

export function SeoLandingGrid() {
  return (
    <details className="group mb-10 max-w-2xl mx-auto bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
      <summary className="px-6 py-4 font-semibold text-[var(--color-foreground)] cursor-pointer hover:bg-[var(--surface-muted)] transition-colors flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
        Explore Free Education Tools
        <svg
          className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-180 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="p-6 border-t border-[var(--border)] bg-[var(--background)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
          {PRIMARY_SEO_LANDINGS.map((landing) => (
            <SeoLandingGridItem key={landing.path} slug={landing.toolSlug} href={landing.path} />
          ))}
        </div>
      </div>
    </details>
  );
}

function SeoLandingGridItem({ slug, href }: { slug: string; href: string }) {
  const tool = useSeoTool(slug);
  if (!tool) return null;

  return (
    <Link
      href={href}
      className="text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:underline underline-offset-2 transition-colors flex items-center gap-2"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] opacity-50" />
      {tool.h1}
    </Link>
  );
}
