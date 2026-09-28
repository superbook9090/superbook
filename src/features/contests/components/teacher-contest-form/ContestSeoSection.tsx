'use client';

import React from 'react';
import { Search, Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-2xl border border-[var(--border)]/50 shadow-xl group transition-all duration-500 hover:shadow-2xl hover:bg-[var(--card-solid)]/60">
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]/40">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 shadow-sm">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">
              {t('contest.seoSettings')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Admin-only configuration for search engine indexing & custom URL
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
              {t('contest.urlSlugOptional')}
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] pointer-events-none" />
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="e.g. math-olympiad-2026"
                className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
              {t('contest.metaTitleOptional')}
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={t('contest.metaTitlePlaceholder')}
              maxLength={70}
              className="w-full px-4 py-3 text-sm font-semibold rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
              {t('contest.metaDescriptionOptional')}
            </label>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder={t('contest.metaDescPlaceholder')}
              maxLength={180}
              className="w-full px-4 py-2.5 text-sm rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
