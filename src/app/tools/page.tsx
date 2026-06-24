import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo/metadata';
import { getSiteUrl } from '@/lib/seo/config';
import { SEO_TOOLS_DATA } from '@/data/seo-tools';
import { PRIMARY_SEO_LANDINGS, getCanonicalSeoPath } from '@/lib/seo/landing-routes';
import MarketingHeader from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { ROUTES } from '@/constants/routes';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Free Education Tools — Quiz Maker, Course Builder & More',
  description: 'Explore Quiz-Do\'s free education tools: quiz maker, MCQ generator, AI quiz generator, course maker, test series builder, and LMS platform.',
  path: '/tools',
  keywords: ['quiz maker', 'course maker', 'test series', 'MCQ generator', 'LMS tools'],
});

export default function ToolsIndexPage() {
  const primaryPaths = new Set(PRIMARY_SEO_LANDINGS.map((r) => r.toolSlug));

  const toolEntries = Object.values(SEO_TOOLS_DATA).map((tool) => {
    const canonicalPath = getCanonicalSeoPath(tool.slug) ?? `/tools/${tool.slug}`;
    return { tool, href: canonicalPath };
  });

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: getSiteUrl() },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${getSiteUrl()}/tools` },
    ],
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <MarketingHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--color-foreground)] mb-4">Free Education Tools</h1>
          <p className="text-lg text-[var(--color-muted-foreground)]">
            Quiz-Do offers a suite of free tools for teachers, students, and coaching institutes —
            from quiz creation to full course and test series building.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">Popular Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRIMARY_SEO_LANDINGS.map((landing) => (
              <Link
                key={landing.path}
                href={landing.path}
                className="rounded-2xl border-2 border-[var(--student-border)] bg-[var(--student-soft)] p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-2">{landing.label}</h3>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {SEO_TOOLS_DATA[landing.toolSlug]?.intro.slice(0, 120)}...
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">All Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolEntries
              .filter(({ tool }) => !primaryPaths.has(tool.slug) || getCanonicalSeoPath(tool.slug) === `/tools/${tool.slug}`)
              .map(({ tool, href }) => (
                <Link
                  key={tool.slug}
                  href={href}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] p-5 hover:shadow-sm transition-shadow"
                >
                  <h3 className="font-semibold text-[var(--color-foreground)] mb-1">{tool.h1}</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2">{tool.description}</p>
                </Link>
              ))}
          </div>
        </section>

        <section className="mt-16 pt-10 border-t border-[var(--border)] flex flex-wrap justify-center gap-4">
          <Link href={ROUTES.blogs} className="text-[var(--color-primary)] font-semibold hover:underline">
            Educational Blogs →
          </Link>
          <Link href="/courses" className="text-[var(--color-primary)] font-semibold hover:underline">
            Public Courses →
          </Link>
          <Link href={ROUTES.register} className="text-[var(--color-primary)] font-semibold hover:underline">
            Get Started Free →
          </Link>
        </section>
      </div>
      <Footer />
    </main>
  );
}
