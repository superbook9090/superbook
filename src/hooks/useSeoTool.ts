'use client';

import { useMemo } from 'react';
import type { SeoToolData } from '@/data/seo-tools';
import { getSeoToolContent } from '@/lib/seo/getSeoToolContent';
import { useTranslation } from '@/hooks/useTranslation';

export function useSeoTool(slug: string): SeoToolData | null {
  const { lang } = useTranslation();

  return useMemo(() => getSeoToolContent(slug, lang), [slug, lang]);
}
