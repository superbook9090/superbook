import type { MetadataRoute } from 'next';
import { ROUTES } from '@/constants/routes';
import { getSiteUrl } from '@/lib/seo/config';
import { SEO_TOOLS_DATA } from '@/data/seo-tools';
import { buildPublicBlogPath, listPublicBlogSlugs } from '@/lib/blogs/public';

/** Public marketing pages included in search indexing. */
const PUBLIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: ROUTES.home, changeFrequency: 'weekly', priority: 1 },
  { path: ROUTES.howItWorks, changeFrequency: 'monthly', priority: 0.8 },
  { path: ROUTES.login, changeFrequency: 'monthly', priority: 0.6 },
  { path: ROUTES.register, changeFrequency: 'monthly', priority: 0.8 },
  { path: ROUTES.contact, changeFrequency: 'monthly', priority: 0.7 },
  { path: ROUTES.privacy, changeFrequency: 'yearly', priority: 0.3 },
  { path: ROUTES.forgotPassword, changeFrequency: 'yearly', priority: 0.2 },
  { path: ROUTES.blogs, changeFrequency: 'daily', priority: 0.9 },
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

  const toolPages: MetadataRoute.Sitemap = Object.keys(SEO_TOOLS_DATA).map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const blogSlugs = await listPublicBlogSlugs(500);
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}${buildPublicBlogPath(slug)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...pages, ...toolPages, ...blogPages];
}
