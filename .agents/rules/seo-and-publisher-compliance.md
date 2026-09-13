# SEO, Publisher Compliance & Public Marketing Shell Rules

All public marketing pages, blog articles, legal disclosures, and sitemaps must adhere to the following standards:

## 1. Google AdSense & Publisher Compliance
- **Root `ads.txt`**: Must always exist at `public/ads.txt` with authorized seller record (`google.com, pub-3910555435236193, DIRECT, f08c47fec0942fa0`). Never delete or overwrite this entry.
- **Client Tag**: The AdSense client script must be loaded asynchronously via `src/components/providers/AdsenseInit.tsx` in `src/app/layout.tsx`.
- **Mandatory Trust Routes**: `/about`, `/terms`, `/privacy`, and `/contact` must always return HTTP 200, have complete meta descriptions, and be prominently linked in `Footer.tsx`.
- **Privacy Policy Disclosures**: `/privacy` must always include the third-party advertising clause detailing Google AdSense, DoubleClick DART cookies, and opt-out links (`adssettings.google.com` & `aboutads.info`) in both `en.ts` and `hi.ts`.

## 2. Blog Route Canonicalization & Layout Shell
- **Definitive Canonical Route**: Individual blog articles MUST use `/blog/[slug]` as the canonical route.
- **Legacy Route 301 Redirect**: `src/app/blogs/[slug]/page.tsx` must issue a permanent 301/308 redirect to `/blog/${slug}` to prevent duplicate content indexing.
- **Shared Marketing Shell**: `src/app/blog/layout.tsx` must wrap all blog post pages with `MarketingHeader`, `Footer`, and `QueryProvider`. Never allow an individual article to render as an orphaned page without navigation.

## 3. Thin Content & Test Post Guardrails
- **Public Visibility Filter**: In `src/lib/blogs/public.ts` (`publicVisibilityFilter`) and `src/app/api/blogs/route.ts` (`publicBlogAccessFilter`), queries MUST include:
  ```ts
  title: { $not: /^test\d*$/i }
  ```
  Test drafts or dummy posts must NEVER be indexed in `sitemap.xml` or displayed on the public website.
- **Minimum Content Quality**: Educational articles must be substantive (minimum 600–1,000+ words) with proper subheadings (`<h2>`, `<h3>`), practical examples, reading times, and author attribution.
- **Ghost Category Prevention**: `listPublicBlogTopics()` must only return topics that contain at least one published, non-test article.

## 4. Sitemap Architecture (`src/app/sitemap.ts`)
- **Database Timestamps**: Use real MongoDB `updatedAt || createdAt` timestamps for dynamic entries (`listPublicBlogSitemapEntries`, `listPublicCourseSitemapEntries`). Never use dynamic `new Date()` per request.
- **Static Route Reference**: Static marketing pages must use a stable reference date (`STATIC_PAGES_LASTMOD`).
- **Priority & Frequencies**: High-intent tools and homepage use priority `1.0` or `0.95`; blog articles and courses use `0.8`–`0.85`; legal pages use `0.3` with `yearly` frequency.

## 5. Structured Data & E-E-A-T
- Public blog articles must render valid `Article` and `BreadcrumbList` JSON-LD schemas.
- Article schema must include high-resolution `image` (1200x630px via `public/og-image.png` or featured image), `datePublished`, `dateModified`, `author`, `publisher`, and `inLanguage`.
