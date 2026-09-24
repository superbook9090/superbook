import type { MetadataRoute } from 'next';
import { ROUTES } from '@/constants/routes';
import { getSiteUrl } from '@/lib/seo/config';
import { SEO_TOOLS_DATA } from '@/data/seo-tools';
import { getAllSeoLandingPaths } from '@/lib/seo/landing-routes';
import {
  buildPublicBlogPath,
  listPublicBlogSitemapEntries,
  listPublicBlogTopics,
  blogTopicSlug,
} from '@/lib/blogs/public';
import { buildPublicCoursePath, listPublicCourseSitemapEntries } from '@/lib/courses/public';
import { getCanonicalSeoPath } from '@/lib/seo/landing-routes';

/** Public marketing pages included in search indexing. */
const PUBLIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: ROUTES.home, changeFrequency: 'weekly', priority: 1 },
  { path: ROUTES.howItWorks, changeFrequency: 'monthly', priority: 0.8 },
  { path: ROUTES.register, changeFrequency: 'monthly', priority: 0.8 },
  { path: ROUTES.contact, changeFrequency: 'monthly', priority: 0.7 },
  { path: ROUTES.about, changeFrequency: 'monthly', priority: 0.8 },
  { path: ROUTES.privacy, changeFrequency: 'yearly', priority: 0.3 },
  { path: ROUTES.terms, changeFrequency: 'yearly', priority: 0.3 },
  { path: ROUTES.blogs, changeFrequency: 'daily', priority: 0.9 },
  { path: '/tools', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/courses', changeFrequency: 'daily', priority: 0.9 },
];

// Stable reference timestamp for marketing pages (updated periodically rather than per request)
const STATIC_PAGES_LASTMOD = new Date('2026-09-13T00:00:00.000Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const pages = PUBLIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path === '/' ? '' : path}`,
    lastModified: STATIC_PAGES_LASTMOD,
    changeFrequency,
    priority,
  }));

  const seoLandingPages: MetadataRoute.Sitemap = getAllSeoLandingPaths().map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: STATIC_PAGES_LASTMOD,
    changeFrequency: 'weekly' as const,
    priority: path === '/quiz-maker-free' ? 1 : 0.95,
  }));

  const toolPages: MetadataRoute.Sitemap = Object.keys(SEO_TOOLS_DATA)
    .filter((slug) => !getCanonicalSeoPath(slug))
    .map((slug) => ({
      url: `${baseUrl}/tools/${slug}`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  let blogPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];
  let coursePages: MetadataRoute.Sitemap = [];

  try {
    const blogEntries = await listPublicBlogSitemapEntries(500);
    blogPages = blogEntries.map(({ slug, lastModified }) => ({
      url: `${baseUrl}${buildPublicBlogPath(slug)}`,
      lastModified: new Date(lastModified),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const topics = await listPublicBlogTopics();
    categoryPages = topics.map((topic) => ({
      url: `${baseUrl}/blogs/category/${blogTopicSlug(topic)}`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));

    const courseEntries = await listPublicCourseSitemapEntries(200);
    coursePages = courseEntries.map(({ slug, lastModified }) => ({
      url: `${baseUrl}${buildPublicCoursePath(slug)}`,
      lastModified: new Date(lastModified),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));
  } catch (error) {
    console.warn('[sitemap] Could not fetch dynamic routes for sitemap at build time:', (error as Error).message);
  }

  return [...pages, ...seoLandingPages, ...toolPages, ...blogPages, ...categoryPages, ...coursePages];
}
