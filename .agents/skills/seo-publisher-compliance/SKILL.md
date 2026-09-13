---
name: seo-publisher-compliance
description: >-
  Use this skill when auditing, implementing, or maintaining SEO metadata, OpenGraph assets,
  Google AdSense publisher compliance, sitemap generation, structured data (JSON-LD),
  and publisher trust pages (/about, /terms, /privacy, /contact).
---

# SEO & Publisher Compliance (Google AdSense) Skill

This skill provides operational procedures, runbooks, and audit workflows for search engine optimization, Google AdSense compliance, dynamic sitemaps, and E-E-A-T trust signals on Quiz Do.

---

## 1. Google AdSense Publisher Compliance Checklist

When auditing or preparing `quizdo.in` for Google AdSense review:

1. **`public/ads.txt` Verification**:
   - Check that `public/ads.txt` contains:
     ```
     google.com, pub-3910555435236193, DIRECT, f08c47fec0942fa0
     ```
   - Verify via curl: `curl -s -i http://localhost:3000/ads.txt` (must return HTTP 200).

2. **Mandatory Publisher Pages**:
   - `/about`: Mission, educational vision, platform offerings, and publisher identity.
   - `/terms`: Terms of Service with acceptable use and third-party advertising disclaimer.
   - `/privacy`: Privacy Policy containing Google AdSense DoubleClick DART cookie disclosure and opt-out links.
   - `/contact`: Direct support channels and inquiry forms.
   - All 4 routes must be linked in `src/components/home/Footer.tsx` and included in `src/app/sitemap.ts`.

3. **AdSense Script Initialization**:
   - Script is loaded asynchronously via `src/components/providers/AdsenseInit.tsx`.
   - Never inject synchronous or blocking third-party scripts in `<head>`.

---

## 2. Content Quality & Thin Content Guardrails

Google AdSense strictly enforces "Minimum content requirements" and penalizes "Thin content":

1. **Test Post Exclusions**:
   - Any query returning public blogs or topics MUST filter out test titles:
     ```ts
     title: { $not: /^test\d*$/i }
     ```
   - Implemented in `src/lib/blogs/public.ts` (`publicVisibilityFilter`) and `src/app/api/blogs/route.ts` (`publicBlogAccessFilter`).

2. **Substantive Educational Guides**:
   - Blog articles must be in-depth (minimum 600–1,000+ words).
   - Use proper structural markup: `<h2>`, `<h3>`, bullet lists, comparison tables, reading time indicators, and author cards.

3. **Seeding Production Content**:
   - To seed or refresh high-quality articles on the live database:
     ```bash
     MONGODB_URI="<PRODUCTION_URI>" node scripts/seed-adsense-articles.mjs
     ```

---

## 3. Blog Layout & Route Canonicalization

1. **Primary Canonical Route**:
   - All blog articles live at `/blog/[slug]` (configured in `ROUTES.blog` and `buildPublicBlogPath`).
   - `src/app/blog/layout.tsx` wraps all articles in `MarketingHeader`, `Footer`, and `QueryProvider`.
   - Articles must never render as orphaned/naked pages without navigation.

2. **301 Permanent Redirect**:
   - `src/app/blogs/[slug]/page.tsx` must issue a 301/308 permanent redirect:
     ```ts
     permanentRedirect(ROUTES.blog(slug));
     ```

---

## 4. Sitemap Generation (`src/app/sitemap.ts`)

1. **Real Database Timestamps**:
   - Blogs: `listPublicBlogSitemapEntries` pulls `updatedAt || createdAt`.
   - Courses: `listPublicCourseSitemapEntries` pulls `updatedAt || createdAt`.
   - Static pages: uses a stable date reference (`STATIC_PAGES_LASTMOD`), not dynamic `new Date()`.

2. **Auditing the Sitemap**:
   ```bash
   curl -s http://localhost:3000/sitemap.xml | grep -o "<loc>[^<]*</loc>"
   ```
   Verify that:
   - Zero `test*` slugs appear.
   - Every category URL has active, substantive articles.
   - `/about`, `/terms`, `/privacy`, `/contact` are present.

---

## 5. Verification Commands

Run before committing any changes:
```bash
npx tsc --noEmit
npm run lint
npm run check:push
```
