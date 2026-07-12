import { SEO_TOOLS_DATA, type SeoToolData } from '@/data/seo-tools';

import type { Language } from '@/i18n';
import { SEO_TOOLS_HI } from '@/i18n/seo-tools';

export function getSeoToolContent(slug: string, lang: Language): SeoToolData | null {
  const english = SEO_TOOLS_DATA[slug];
  if (!english) return null;

  if (lang === 'hi') {
    return SEO_TOOLS_HI[slug] ?? english;
  }

  return english;
}

export function getSeoToolLabel(slug: string, lang: Language): string {
  const tool = getSeoToolContent(slug, lang);
  return tool?.h1 ?? slug;
}
