import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createPageMetadata } from '@/lib/seo/metadata';
import { getSiteUrl } from '@/lib/seo/config';
import {
  buildPublicBlogPath,
  listPublicBlogs,
  listPublicBlogTopics,
  blogTopicSlug,
} from '@/lib/blogs/public';

function topicFromSlug(slug: string, topics: string[]): string | null {
  const decoded = decodeURIComponent(slug);
  const match = topics.find((t) => blogTopicSlug(t) === decoded || t.toLowerCase() === decoded.toLowerCase());
  return match ?? null;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const topics = await listPublicBlogTopics();
  return topics.map((topic) => ({ topic: blogTopicSlug(topic) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic: topicSlug } = await params;
  const topics = await listPublicBlogTopics();
  const topic = topicFromSlug(topicSlug, topics);
  if (!topic) {
    return createPageMetadata({ title: 'Category Not Found', path: `/blogs/category/${topicSlug}`, index: false });
  }

  return createPageMetadata({
    title: `${topic} — Educational Articles`,
    description: `Read ${topic} articles on Quiz-Do. Study tips, exam preparation guides, and learning resources for students and teachers.`,
    path: `/blogs/category/${topicSlug}`,
    keywords: [topic, 'education blog', 'exam preparation', 'study tips'],
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: topicSlug } = await params;
  const topics = await listPublicBlogTopics();
  const topic = topicFromSlug(topicSlug, topics);
  if (!topic) notFound();

  const [data] = await Promise.all([
    listPublicBlogs({ page: 1, limit: 12, topic, sort: 'latest' }),
  ]);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: getSiteUrl() },
      { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${getSiteUrl()}/blogs` },
      { '@type': 'ListItem', position: 3, name: topic, item: `${getSiteUrl()}/blogs/category/${topicSlug}` },
    ],
  };

  return (
    <main className="page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <header className="mb-8">
        <nav className="text-sm text-[var(--color-muted-foreground)] mb-4">
          <Link href="/blogs" className="hover:text-[var(--color-primary)]">Blogs</Link>
          <span className="mx-2">/</span>
          <span>{topic}</span>
        </nav>
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">{topic}</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">
          Articles about {topic.toLowerCase()} for students, teachers, and exam aspirants.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.blogs.map((blog) => (
          <article
            key={blog._id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] mb-2">{blog.topic}</p>
            <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
              <Link href={buildPublicBlogPath(blog.slug)} className="hover:text-[var(--color-primary)]">
                {blog.title}
              </Link>
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-3 mb-4">{blog.excerpt}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">{blog.readingTimeMinutes} min read</p>
          </article>
        ))}
      </div>
      <p className="mt-8 text-center">
        <Link href="/blogs" className="text-[var(--color-primary)] font-semibold hover:underline">
          Browse all articles →
        </Link>
      </p>
    </main>
  );
}
