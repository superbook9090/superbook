'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useSeoTool } from '@/hooks/useSeoTool';
import { SEO_TOOLS_DATA } from '@/data/seo-tools';
import { PRIMARY_SEO_LANDINGS, getCanonicalSeoPath } from '@/lib/seo/landing-routes';
import { ROUTES } from '@/constants/routes';
import { useFeature } from '@/contexts/AppSettingsContext';
import MarketingHeader from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';

export default function ToolsIndexClient() {
  const { t } = useTranslation();
  const enableBlogs = useFeature('enableBlogs');
  const enableCourses = useFeature('enableCourses');
  const primaryPaths = new Set(PRIMARY_SEO_LANDINGS.map((r) => r.toolSlug));

  const toolEntries = Object.values(SEO_TOOLS_DATA).map((tool) => {
    const canonicalPath = getCanonicalSeoPath(tool.slug) ?? `/tools/${tool.slug}`;
    return { slug: tool.slug, href: canonicalPath };
  });

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <MarketingHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--color-foreground)] mb-4">{t('seoTools.index.title')}</h1>
          <p className="text-lg text-[var(--color-muted-foreground)]">{t('seoTools.index.subtitle')}</p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">{t('seoTools.index.popularTools')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRIMARY_SEO_LANDINGS.map((landing) => (
              <ToolCard key={landing.path} slug={landing.toolSlug} href={landing.path} featured />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">{t('seoTools.index.allTools')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolEntries
              .filter(({ slug }) => !primaryPaths.has(slug) || getCanonicalSeoPath(slug) === `/tools/${slug}`)
              .map(({ slug, href }) => (
                <ToolCard key={slug} slug={slug} href={href} />
              ))}
          </div>
        </section>

        <section className="mt-16 pt-10 border-t border-[var(--border)] flex flex-wrap justify-center gap-4">
          {enableBlogs && (
            <Link href={ROUTES.blogs} className="text-[var(--color-primary)] font-semibold hover:underline">
              {t('seoTools.index.educationalBlogs')}
            </Link>
          )}
          {enableCourses && (
            <Link href={ROUTES.courses} className="text-[var(--color-primary)] font-semibold hover:underline">
              {t('seoTools.index.publicCourses')}
            </Link>
          )}
          <Link href={ROUTES.register} className="text-[var(--color-primary)] font-semibold hover:underline">
            {t('seoTools.index.getStartedFree')}
          </Link>
        </section>
      </div>
      <Footer />
    </main>
  );
}

function ToolCard({ slug, href, featured = false }: { slug: string; href: string; featured?: boolean }) {
  const tool = useSeoTool(slug);
  if (!tool) return null;

  return (
    <Link
      href={href}
      className={
        featured
          ? 'rounded-2xl border-2 border-[var(--student-border)] bg-[var(--student-soft)] p-6 hover:shadow-md transition-shadow'
          : 'rounded-xl border border-[var(--border)] bg-[var(--card-solid)] p-5 hover:shadow-sm transition-shadow'
      }
    >
      <h3 className={`font-bold text-[var(--color-foreground)] mb-2 ${featured ? 'text-lg' : 'font-semibold mb-1'}`}>
        {tool.h1}
      </h3>
      <p className={`text-[var(--color-muted-foreground)] ${featured ? 'text-sm' : 'text-sm line-clamp-2'}`}>
        {featured ? `${tool.intro.slice(0, 120)}...` : tool.description}
      </p>
    </Link>
  );
}
