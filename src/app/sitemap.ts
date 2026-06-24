import type { MetadataRoute } from 'next';
import { ROUTES } from '@/constants/routes';
import { getSiteUrl } from '@/lib/seo/config';
import { SEO_TOOLS_DATA } from '@/data/seo-tools';
import { getAllSeoLandingPaths } from '@/lib/seo/landing-routes';
import { buildPublicBlogPath, listPublicBlogSlugs, listPublicBlogTopics, blogTopicSlug } from '@/lib/blogs/public';
import { buildPublicCoursePath, listPublicCourseSlugs } from '@/lib/courses/public';
import { getCanonicalSeoPath } from '@/lib/seo/landing-routes';

/** Public marketing pages included in search indexing. */
const PUBLIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: ROUTES.home, changeFrequency: 'weekly', priority: 1 },
  { path: ROUTES.howItWorks, changeFrequency: 'monthly', priority: 0.8 },
  { path: ROUTES.register, changeFrequency: 'monthly', priority: 0.8 },
  { path: ROUTES.contact, changeFrequency: 'monthly', priority: 0.7 },
  { path: ROUTES.privacy, changeFrequency: 'yearly', priority: 0.3 },
  { path: ROUTES.blogs, changeFrequency: 'daily', priority: 0.9 },
  { path: '/tools', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/courses', changeFrequency: 'daily', priority: 0.9 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const pages = PUBLIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const seoLandingPages: MetadataRoute.Sitemap = getAllSeoLandingPaths().map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '/quiz-maker-free' ? 1 : 0.95,
  }));

  const toolPages: MetadataRoute.Sitemap = Object.keys(SEO_TOOLS_DATA)
    .filter((slug) => !getCanonicalSeoPath(slug))
    .map((slug) => ({
      url: `${baseUrl}/tools/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const blogSlugs = await listPublicBlogSlugs(500);
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}${buildPublicBlogPath(slug)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const topics = await listPublicBlogTopics();
  const categoryPages: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${baseUrl}/blogs/category/${blogTopicSlug(topic)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const courseSlugs = await listPublicCourseSlugs(200);
  const coursePages: MetadataRoute.Sitemap = courseSlugs.map((slug) => ({
    url: `${baseUrl}${buildPublicCoursePath(slug)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [...pages, ...seoLandingPages, ...toolPages, ...blogPages, ...categoryPages, ...coursePages];
}
