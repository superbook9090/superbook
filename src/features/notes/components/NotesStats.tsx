import React from 'react';
import { BookOpen, FileText, Pin, Tag, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface NotesStatsProps {
  usedPages: number;
  limitPages: number;
  totalWords: number;
  avgWords: number;
  pinnedCount: number;
  totalTags: number;
  showPinnedOnly: boolean;
  onTogglePinnedFilter: () => void;
}

export function NotesStats({
  usedPages,
  limitPages,
  totalWords,
  avgWords,
  pinnedCount,
  totalTags,
  showPinnedOnly,
  onTogglePinnedFilter,
}: NotesStatsProps) {
  const { t } = useTranslation();
  const quotaPercent = Math.min(100, Math.round((usedPages / Math.max(1, limitPages)) * 100));
  const remaining = Math.max(0, limitPages - usedPages);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Quota Progress Card */}
      <div className="p-4 rounded-2xl bg-[var(--card-solid)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between transition-all hover:border-[var(--color-primary)]/40">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t('notes.quotaUsage')}
          </span>
          <div className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">
              {usedPages}
              <span className="text-sm font-normal text-[var(--color-muted)] ml-1">/ {limitPages}</span>
            </span>
            <span className="text-xs font-medium text-[var(--color-muted)]">
              {t('notes.pagesRemaining').replace('{count}', String(remaining))}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                quotaPercent >= 100
                  ? 'bg-[var(--color-error)]'
                  : quotaPercent >= 80
                  ? 'bg-[var(--color-warning)]'
                  : 'bg-[var(--color-primary)]'
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Total Words Card */}
      <div className="p-4 rounded-2xl bg-[var(--card-solid)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between transition-all hover:border-[var(--success)]/40">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t('notes.totalWords')}
          </span>
          <div className="p-1.5 rounded-lg bg-[var(--success-light)] text-[var(--success)]">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">
            {totalWords.toLocaleString()}
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            ~{avgWords} {t('notes.avgWords')}
          </p>
        </div>
      </div>

      {/* 3. Pinned Notes Card (Interactive) */}
      <button
        type="button"
        onClick={onTogglePinnedFilter}
        className={`p-4 rounded-2xl border shadow-xs flex flex-col justify-between text-left transition-all cursor-pointer min-h-[44px] ${
          showPinnedOnly
            ? 'bg-[var(--warning-light)] border-[var(--warning)]/40 ring-2 ring-[var(--warning)]/20'
            : 'bg-[var(--card-solid)] border-[var(--color-border)] hover:border-[var(--warning)]/40'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2 w-full">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t('notes.pinned')}
          </span>
          <div
            className={`p-1.5 rounded-lg transition-colors ${
              showPinnedOnly || pinnedCount > 0
                ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]'
            }`}
          >
            <Pin className={`w-4 h-4 ${showPinnedOnly ? 'fill-[var(--warning)]' : ''}`} />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
            {pinnedCount}
            {showPinnedOnly && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--warning)] text-white">
                Active Filter
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            {pinnedCount === 1 ? '1 pinned priority note' : `${pinnedCount} priority notes`}
          </p>
        </div>
      </button>

      {/* 4. Tags & Topics Card */}
      <div className="p-4 rounded-2xl bg-[var(--card-solid)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between transition-all hover:border-[var(--primary)]/40">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t('notes.topicsAndTags')}
          </span>
          <div className="p-1.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
            <Tag className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
            {totalTags}
            <Sparkles className="w-4 h-4 text-[var(--primary)] inline" />
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            {totalTags === 0 ? 'No tags yet' : `${totalTags} indexed topics`}
          </p>
        </div>
      </div>
    </div>
  );
}
