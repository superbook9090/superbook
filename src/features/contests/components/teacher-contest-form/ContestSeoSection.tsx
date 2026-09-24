'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { TextField } from '@/components/ui/TextField';

interface ContestSeoSectionProps {
  slug: string;
  setSlug: (value: string) => void;
  metaTitle: string;
  setMetaTitle: (value: string) => void;
  metaDescription: string;
  setMetaDescription: (value: string) => void;
}

export function ContestSeoSection({
  slug,
  setSlug,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
}: ContestSeoSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] text-sm font-bold text-[var(--color-foreground)]">
        <Search className="w-4 h-4 text-[var(--primary)]" />
        <span>{t('contests.seoSettings') || 'SEO Settings'}</span>
      </div>

      <div className="space-y-4">
        <TextField
          label={t('contests.urlSlugOptional') || 'URL Slug (Optional)'}
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
          placeholder="e.g. math-olympiad-2026"
        />

        <TextField
          label={t('contests.metaTitleOptional') || 'Meta Title (Optional)'}
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          placeholder={t('contests.metaTitlePlaceholder') || 'SEO title for search engines (Max 70 chars)'}
          maxLength={70}
        />

        <div>
          <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
            {t('contests.metaDescriptionOptional') || 'Meta Description (Optional)'}
          </label>
          <textarea
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={t('contests.metaDescPlaceholder') || 'SEO description for search engines (Max 180 chars)'}
            maxLength={180}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>
    </div>
  );
}
