import type { MetadataRoute } from 'next';
import { ROUTES } from '@/constants/routes';
import { getSiteUrl } from '@/lib/seo/config';

/** Public marketing pages included in search indexing. */
const PUBLIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: ROUTES.home, changeFrequency: 'weekly', priority: 1 },
  { path: ROUTES.login, changeFrequency: 'monthly', priority: 0.6 },
  { path: ROUTES.register, changeFrequency: 'monthly', priority: 0.8 },
  { path: ROUTES.contact, changeFrequency: 'monthly', priority: 0.7 },
  { path: ROUTES.privacy, changeFrequency: 'yearly', priority: 0.3 },
  { path: ROUTES.forgotPassword, changeFrequency: 'yearly', priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();

  return PUBLIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
