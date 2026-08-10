import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';
import PublicBlogShareButtons from '@/components/blogs/PublicBlogShareButtons';
import PublicBlogViewTracker from '@/components/blogs/PublicBlogViewTracker';
import { buildPublicBlogCanonical, buildPublicBlogPath, getPublicBlogBySlug, listPublicBlogSlugs, listRelatedPublicBlogs } from '@/lib/blogs/public';
import { createPageMetadata } from '@/lib/seo/metadata';
import { getSiteUrl } from '@/lib/seo/config';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';

export const revalidate = 300;
export const dynamicParams = true; // slugs not in generateStaticParams are rendered on first visit and cached

export async function generateStaticParams() {
  const slugs = await listPublicBlogSlugs(50);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);
  if (!blog) {
    return createPageMetadata({ title: 'Blog Not Found', path: `/blogs/${slug}`, index: false });
  }

  return createPageMetadata({
    title: blog.metaTitle,
    description: blog.metaDescription,
    path: buildPublicBlogPath(blog.slug),
    ogType: 'article',
    keywords: [blog.topic, blog.language, 'blog', 'exam preparation'],
  });
}

export default async function PublicBlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureFeatureEnabled('enableBlogs');

  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);
  if (!blog) notFound();

  const related = await listRelatedPublicBlogs(blog.slug, blog.topic, 3);
  const canonical = buildPublicBlogCanonical(blog.slug);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.metaTitle,
    description: blog.metaDescription,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: blog.author?.name ? [{ '@type': 'Person', name: blog.author.name }] : undefined,
    mainEntityOfPage: canonical,
    url: canonical,
    articleSection: blog.topic,
    publisher: {
      '@type': 'Organization',
      name: 'Quiz Do',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: getSiteUrl() },
      { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${getSiteUrl()}/blogs` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: canonical },
    ],
  };

  return (
    <main className="page-shell">
      <PublicBlogViewTracker slug={blog.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <BackButton
            href="/blogs"
            label="Back to Blogs"
            className="hover:text-[var(--color-primary)] mb-6"
          />

          <header className="mb-8 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]">{blog.topic}</p>
            <h1 className="text-4xl font-bold text-[var(--color-foreground)]">{blog.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-[var(--color-muted-foreground)]">
              <span>{new Date(blog.createdAt).toLocaleDateString('en-IN')}</span>
              <span>{blog.readingTimeMinutes} min read</span>
              {blog.author?.name && <span>{blog.author.name}</span>}
            </div>
          </header>

          <div
            className="prose prose-lg max-w-none text-[var(--color-foreground)] prose-headings:text-[var(--color-foreground)] prose-a:text-[var(--color-primary)]"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        <aside className="space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] p-5">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">About this article</h2>
            <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{blog.metaDescription}</p>
            <div className="mt-4 text-sm text-[var(--color-muted-foreground)]">
              <p>Category: {blog.topic}</p>
              <p>Language: {blog.language.toUpperCase()}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] p-5">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Share</h2>
            <div className="mt-4">
              <PublicBlogShareButtons title={blog.title} url={canonical} />
            </div>
          </div>

          {related.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] p-5">
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Related articles</h2>
              <div className="mt-4 space-y-4">
                {related.map((item) => (
                  <article key={item._id}>
                    <h3 className="font-medium text-[var(--color-foreground)]">
                      <Link href={buildPublicBlogPath(item.slug)} className="hover:text-[var(--color-primary)]">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{item.excerpt}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
