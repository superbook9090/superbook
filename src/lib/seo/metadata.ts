import type { Metadata } from 'next';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  EDUCATION_KEYWORDS,
  getSiteUrl,
  getSearchVerificationMeta,
  SITE_NAME,
  TWITTER_HANDLE,
} from '@/lib/seo/config';

export type PageSeoOptions = {
  title?: string;
  description?: string;
  /** Path only, e.g. `/contact` — combined with site URL for canonical & OG url */
  path?: string;
  keywords?: string[];
  /** Set false for login/register; dashboard layout uses noindex separately */
  index?: boolean;
  /** Open Graph type; default `website` */
  ogType?: 'website' | 'article';
};

function mergeKeywords(extra?: string[]): string[] {
  const set = new Set<string>([...EDUCATION_KEYWORDS, ...(extra ?? [])]);
  return Array.from(set);
}

/** Default metadata for the root layout (all public pages inherit unless overridden). */
export function createRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: mergeKeywords(),
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'education',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: '/',
      languages: {
        en: '/',
        hi: '/',
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      alternateLocale: ['hi_IN'],
      url: siteUrl,
      siteName: SITE_NAME,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: '/logo.svg',
          width: 512,
          height: 512,
          alt: `${SITE_NAME} — online learning management system`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: ['/logo.svg'],
      creator: TWITTER_HANDLE,
    },
    appLinks: {
      android: {
        package: 'com.quizdo',
        app_name: SITE_NAME,
      },
      web: {
        url: siteUrl,
        should_fallback: true,
      },
    },
    other: {
      'theme-color': '#7c3aed',
      ...getSearchVerificationMeta(),
    },
  };
}

/** Per-page metadata; use on server `page.tsx` or `layout.tsx` files. */
export function createPageMetadata(options: PageSeoOptions = {}): Metadata {
  const siteUrl = getSiteUrl();
  const path = options.path ?? '/';
  const canonical = path.startsWith('http') ? path : `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const title = options.title;
  const description = options.description ?? DEFAULT_DESCRIPTION;
  const index = options.index !== false;

  return {
    title,
    description,
    keywords: mergeKeywords(options.keywords),
    alternates: {
      canonical: path.startsWith('/') ? path : `/${path}`,
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: options.ogType ?? 'website',
      url: canonical,
      title: title ?? DEFAULT_TITLE,
      description,
      siteName: SITE_NAME,
      images: ['/logo.svg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: title ?? DEFAULT_TITLE,
      description,
      images: ['/logo.svg'],
    },
  };
}

/** Dashboard and authenticated app surfaces should not compete in search results. */
export const DASHBOARD_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};
