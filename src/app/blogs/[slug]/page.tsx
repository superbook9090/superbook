import { permanentRedirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export const dynamic = 'force-static';
export const revalidate = 300;
export const dynamicParams = true;

/**
 * Legacy /blogs/[slug] route handler.
 * Issues a 308/301 permanent redirect to the canonical /blog/[slug] route
 * to avoid duplicate content penalties and consolidate link equity for search engines.
 */
export default async function LegacyBlogsSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(ROUTES.blog(slug));
}
