import { listPublicBlogs, buildPublicBlogCanonical } from '@/lib/blogs/public';
import { getSiteUrl } from '@/lib/seo/config';

export const revalidate = 3600;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const { blogs } = await listPublicBlogs({ page: 1, limit: 50, sort: 'latest' });
  const siteUrl = getSiteUrl();

  const items = blogs
    .map((blog) => {
      const url = buildPublicBlogCanonical(blog.slug);
      return `    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(blog.excerpt)}</description>
      <pubDate>${new Date(blog.createdAt).toUTCString()}</pubDate>
      <category>${escapeXml(blog.topic)}</category>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Quiz Do Educational Blog</title>
    <link>${siteUrl}/blogs</link>
    <description>Study tips, exam preparation guides, and learning resources from Quiz Do.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/blogs/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
