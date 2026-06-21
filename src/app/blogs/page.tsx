import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { listPublicBlogs, listPublicBlogTopics } from '@/lib/blogs/public';
import PublicBlogsClient from '@/features/blogs/components/PublicBlogsClient';

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: 'Blogs',
  description: 'Public Quiz-Do blogs for exam preparation, study strategies, subject explainers, and learning resources.',
  path: '/blogs',
  keywords: ['education blog', 'exam preparation blog', 'study tips', 'quiz-do blogs'],
});

export default async function PublicBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; topic?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || '1'));
  const topic = params.topic || undefined;
  const search = params.search || undefined;

  const [data, topics] = await Promise.all([
    listPublicBlogs({ page, limit: 12, topic, search, sort: 'latest' }),
    listPublicBlogTopics(),
  ]);

  return (
    <main className="page-shell">
      <PublicBlogsClient
        blogs={data.blogs}
        topics={topics}
        pagination={data.pagination}
      />
    </main>
  );
}
