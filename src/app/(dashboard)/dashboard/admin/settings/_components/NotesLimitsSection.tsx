'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Notebook, FileText, Minus, Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppSettings } from './types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  searchQuery?: string;
}

export function NotesLimitsSection({ settings, setSettings, searchQuery = '' }: Props) {
  const { t } = useTranslation();

  const notesLimits = settings.notesLimits ?? {
    maxPagesPerUser: 5,
    maxWordsPerPage: 1000,
  };

  const query = searchQuery.trim().toLowerCase();
  const pageLabel = t('adminSettings.maxPagesPerUser').toLowerCase();
  const wordLabel = t('adminSettings.maxWordsPerPage').toLowerCase();
  const general = t('adminSettings.notesLimits').toLowerCase();

  const matchesPages = !query || pageLabel.includes(query) || general.includes(query);
  const matchesWords = !query || wordLabel.includes(query) || general.includes(query);

  if (!matchesPages && !matchesWords) return null;

  const updatePages = (val: number) => {
    const safeVal = Math.max(1, Math.floor(val));
    setSettings((prev) => ({
      ...prev,
      notesLimits: {
        ...notesLimits,
        maxPagesPerUser: safeVal,
      },
    }));
  };

  const updateWords = (val: number) => {
    const safeVal = Math.max(50, Math.floor(val));
    setSettings((prev) => ({
      ...prev,
      notesLimits: {
        ...notesLimits,
        maxWordsPerPage: safeVal,
      },
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface rounded-xl border border-[var(--border)] overflow-hidden shadow-xs"
    >
      <div className="p-4 sm:p-5 border-b border-[var(--border)]/70 bg-[var(--color-surface-muted)]/30">
        <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] flex items-center gap-2">
          <Notebook className="w-5 h-5 text-[var(--warning)]" />
          {t('adminSettings.notesLimits')}
        </h3>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
          {t('adminSettings.notesLimits')}
        </p>
      </div>

      <div className="p-4 sm:p-5 divide-y divide-[var(--border)]/60">
        {/* Max Pages Per User */}
        {matchesPages && (
          <div className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 rounded-xl shrink-0 bg-[var(--warning-light)] text-[var(--warning)] shadow-xs mt-0.5">
                <Notebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                  {t('adminSettings.maxPagesPerUser')}
                </h4>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                  {t('adminSettings.maxPagesPerUserDesc')}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1 bg-[var(--color-surface-muted)] p-1 rounded-lg border border-[var(--border)]/50">
                {[3, 5, 10, 25, 50].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updatePages(p)}
                    className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                      notesLimits.maxPagesPerUser === p
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex items-center border border-[var(--border)] rounded-lg bg-[var(--card-solid)] overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => updatePages(notesLimits.maxPagesPerUser - 1)}
                  disabled={notesLimits.maxPagesPerUser <= 1}
                  className="p-2 sm:p-2.5 text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={notesLimits.maxPagesPerUser}
                  onChange={(e) => updatePages(parseInt(e.target.value) || 1)}
                  className="w-14 text-center text-xs sm:text-sm font-bold text-[var(--color-foreground)] bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => updatePages(notesLimits.maxPagesPerUser + 1)}
                  className="p-2 sm:p-2.5 text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Max Words Per Page */}
        {matchesWords && (
          <div className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 rounded-xl shrink-0 bg-[var(--info-light)] text-[var(--info)] shadow-xs mt-0.5">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                  {t('adminSettings.maxWordsPerPage')}
                </h4>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                  {t('adminSettings.maxWordsPerPageDesc')}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1 bg-[var(--color-surface-muted)] p-1 rounded-lg border border-[var(--border)]/50">
                {[500, 1000, 2000, 5000].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => updateWords(w)}
                    className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                      notesLimits.maxWordsPerPage === w
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)]'
                    }`}
                  >
                    {w}w
                  </button>
                ))}
              </div>

              <div className="flex items-center border border-[var(--border)] rounded-lg bg-[var(--card-solid)] overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => updateWords(notesLimits.maxWordsPerPage - 100)}
                  disabled={notesLimits.maxWordsPerPage <= 50}
                  className="p-2 sm:p-2.5 text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={notesLimits.maxWordsPerPage}
                  onChange={(e) => updateWords(parseInt(e.target.value) || 50)}
                  className="w-16 text-center text-xs sm:text-sm font-bold text-[var(--color-foreground)] bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => updateWords(notesLimits.maxWordsPerPage + 100)}
                  className="p-2 sm:p-2.5 text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
