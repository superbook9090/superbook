import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { listPublicBlogs, listPublicBlogTopics } from '@/lib/blogs/public';
import PublicBlogsClient from '@/features/blogs/components/PublicBlogsClient';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: 'Blogs',
  description: 'Public Quiz Do blogs for exam preparation, study strategies, subject explainers, and learning resources.',
  path: '/blogs',
  keywords: ['education blog', 'exam preparation blog', 'study tips', 'quiz-do blogs'],
});

export default async function PublicBlogsPage() {
  await ensureFeatureEnabled('enableBlogs');

  let data: Awaited<ReturnType<typeof listPublicBlogs>> = {
    blogs: [],
    pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
  };
  let topics: string[] = [];

  try {
    [data, topics] = await Promise.all([
      listPublicBlogs({ page: 1, limit: 12, sort: 'latest' }),
      listPublicBlogTopics(),
    ]);
  } catch (err) {
    console.error('[/blogs] Failed to fetch initial blog data:', err);
    throw err;
  }

  return (
    <main className="page-shell">
      <Suspense fallback={null}>
        <PublicBlogsClient
          blogs={data.blogs}
          topics={topics}
          pagination={data.pagination}
        />
      </Suspense>
    </main>
  );
}
