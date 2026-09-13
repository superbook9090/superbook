import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, UserCheck, Sparkles, BookOpen } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import PublicBlogShareButtons from '@/components/blogs/PublicBlogShareButtons';
import PublicBlogViewTracker from '@/components/blogs/PublicBlogViewTracker';
import {
  buildPublicBlogCanonical,
  buildPublicBlogPath,
  getPublicBlogBySlug,
  listPublicBlogSlugs,
  listRelatedPublicBlogs,
  extractFirstImageFromHtml,
  blogTopicSlug,
} from '@/lib/blogs/public';
import { createPageMetadata } from '@/lib/seo/metadata';
import { getSiteUrl } from '@/lib/seo/config';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';

export const dynamic = 'force-static';
export const revalidate = 300;
export const dynamicParams = true; // slugs not in generateStaticParams are rendered on first visit and cached

export async function generateStaticParams() {
  try {
    const slugs = await listPublicBlogSlugs(50);
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.warn('[generateStaticParams] Could not prefetch blog slugs at build time. Falling back to on-demand generation.', error);
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);
  if (!blog) {
    return createPageMetadata({ title: 'Blog Not Found', path: buildPublicBlogPath(slug), index: false });
  }

  const siteUrl = getSiteUrl();
  const contentImage = extractFirstImageFromHtml(blog.content);
  const ogImage = contentImage || `${siteUrl}/og-image.png`;

  return createPageMetadata({
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    path: buildPublicBlogPath(blog.slug),
    ogType: 'article',
    images: [ogImage],
    keywords: [blog.topic, blog.language, 'blog', 'exam preparation', 'study guide', 'quiz-do'],
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

  const siteUrl = getSiteUrl();
  const related = await listRelatedPublicBlogs(blog.slug, blog.topic, 3);
  const canonical = buildPublicBlogCanonical(blog.slug);
  const topicSlug = blogTopicSlug(blog.topic);
  const categoryUrl = `${siteUrl}/blogs/category/${topicSlug}`;

  const contentImage = extractFirstImageFromHtml(blog.content);
  const articleImageUrl = contentImage || `${siteUrl}/og-image.png`;

  const authorName =
    blog.author?.name && blog.author.name.toLowerCase() !== 'admin'
      ? blog.author.name
      : 'Quiz Do Editorial Team';

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    image: [articleImageUrl],
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    inLanguage: blog.language || 'en',
    author: [
      {
        '@type': 'Person',
        name: authorName,
        jobTitle: 'Educational Content Contributor',
        worksFor: {
          '@type': 'Organization',
          name: 'Quiz Do',
          url: siteUrl,
        },
      },
    ],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    url: canonical,
    articleSection: blog.topic,
    publisher: {
      '@type': 'Organization',
      name: 'Quiz Do',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.svg`,
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${siteUrl}/blogs` },
      { '@type': 'ListItem', position: 3, name: blog.topic, item: categoryUrl },
      { '@type': 'ListItem', position: 4, name: blog.title, item: canonical },
    ],
  };

  return (
    <main className="page-shell">
      <PublicBlogViewTracker slug={blog.slug} />
      <script
        id={`jsonld-blog-article-${blog._id}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        id={`jsonld-blog-breadcrumb-${blog._id}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Visual Semantic Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
        <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <Link href="/blogs" className="hover:text-[var(--color-primary)] transition-colors">
          Blogs
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <Link href={`/blogs/category/${topicSlug}`} className="hover:text-[var(--color-primary)] transition-colors font-medium">
          {blog.topic}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="truncate max-w-[280px] sm:max-w-md text-[var(--color-foreground)]" aria-current="page">
          {blog.title}
        </span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <BackButton
            href="/blogs"
            label="Back to Blogs"
            className="hover:text-[var(--color-primary)] mb-6"
          />

          <header className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/blogs/category/${topicSlug}`}
                className="inline-flex items-center rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] hover:bg-[var(--primary)]/15 transition-colors"
              >
                {blog.topic}
              </Link>
              {blog.language && (
                <span className="inline-flex items-center rounded-full bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-muted-foreground)]">
                  {blog.language === 'hi' ? 'हिंदी' : blog.language.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-foreground)] leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted-foreground)] pb-2 border-b border-[var(--border)]">
              <span>Published: {new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>•</span>
              <span>{blog.readingTimeMinutes} min read</span>
              <span>•</span>
              <span className="font-medium text-[var(--color-foreground)]">{authorName}</span>
            </div>
          </header>

          <div
            className="prose prose-lg max-w-none text-[var(--color-foreground)] prose-headings:text-[var(--color-foreground)] prose-a:text-[var(--color-primary)] [&_aside>div:nth-of-type(n+4)]:hidden"
            dangerouslySetInnerHTML={{
              __html: (() => {
                let clean = blog.content || '';

                // Fix CMS exact duplication bug
                const half = Math.floor(clean.length / 2);
                if (clean.length > 200 && clean.substring(0, half) === clean.substring(half)) {
                  clean = clean.substring(0, half);
                }

                // Remove the first H1 if it matches the page title
                const h1Match = clean.match(/<h1[^>]*>(.*?)<\/h1>/i);
                if (h1Match && h1Match[1].replace(/<[^>]+>/g, '').trim() === blog.title.trim()) {
                  clean = clean.replace(h1Match[0], '');
                }

                // Convert remaining H1s to H2s to keep a single H1 per page
                clean = clean.replace(/<h1/gi, '<h2').replace(/<\/h1>/gi, '</h2>');

                return clean;
              })(),
            }}
          />

          {/* E-E-A-T Author & Editorial Review Box */}
          <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-6 sm:p-7 shadow-[var(--shadow-sm)]">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[var(--primary)]/10 p-3 text-[var(--color-primary)] shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--color-foreground)]">{authorName}</h3>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Contributor
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                  Published on Quiz Do. Articles are authored and reviewed by educational practitioners to provide syllabus-aligned explanations, study tips, and assessment guidance.
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] pt-1">
                  Last updated: {new Date(blog.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] p-5">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">About this article</h2>
            <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{blog.metaDescription || blog.excerpt}</p>
            <div className="mt-4 text-sm text-[var(--color-muted-foreground)] space-y-1">
              <p>Category: <span className="font-medium text-[var(--color-foreground)]">{blog.topic}</span></p>
              <p>Language: <span className="font-medium text-[var(--color-foreground)]">{blog.language.toUpperCase()}</span></p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] p-5">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Share article</h2>
            <div className="mt-4">
              <PublicBlogShareButtons title={blog.title} url={canonical} />
            </div>
          </div>

          {/* Contextual Free Tools Promotion (Internal Link Building) */}
          <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--card-solid)] to-[var(--color-surface-muted)] p-5 space-y-4">
            <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-sm">
              <Sparkles className="w-4 h-4" /> Free Study &amp; Exam Tools
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Level up your exam prep with interactive tests and free AI generators on Quiz Do.
            </p>
            <div className="space-y-2 text-sm font-medium">
              <Link href="/quiz-maker-free" className="flex items-center justify-between rounded-lg p-2 hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors">
                <span>Free Online Quiz Maker</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
              <Link href="/ai-quiz-generator" className="flex items-center justify-between rounded-lg p-2 hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors">
                <span>AI Quiz Generator</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
              <Link href="/mcq-generator" className="flex items-center justify-between rounded-lg p-2 hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors">
                <span>Instant MCQ Generator</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
              <Link href="/courses" className="flex items-center justify-between rounded-lg p-2 hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors">
                <span>Browse Practice Courses</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            </div>
          </div>

          {/* Related Articles Widget */}
          {related.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] p-5 related-articles-widget">
              <div className="flex items-center gap-2 text-base font-semibold text-[var(--color-foreground)]">
                <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                Related articles
              </div>
              <div className="mt-4 space-y-4">
                {related.map((item) => (
                  <article key={item._id}>
                    <h3 className="font-medium text-sm text-[var(--color-foreground)] line-clamp-2">
                      <Link href={buildPublicBlogPath(item.slug)} className="hover:text-[var(--color-primary)] transition-colors">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)] line-clamp-2">{item.excerpt}</p>
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
