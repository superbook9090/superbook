'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Plus, LayoutGrid, Table as TableIcon, Trash2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';

interface AdminQuizzesHeroProps {
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  isSuperAdmin?: boolean;
  onOpenCleanupModal?: () => void;
}

export function AdminQuizzesHero({
  viewMode,
  onViewModeChange,
  isSuperAdmin = false,
  onOpenCleanupModal,
}: AdminQuizzesHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 md:p-8 rounded-3xl">
      <div className="space-y-1.5 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)] shadow-xs">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t('common.allQuizzes')}</span>
        </div>
        <h1 className="heading-xl">{t('common.allQuizzes')}</h1>
        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
          {t('admin.manageQuizzesDesc')}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
        {isSuperAdmin && onOpenCleanupModal && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOpenCleanupModal}
            className="flex items-center gap-1.5 min-h-[42px] px-3.5 border-red-500/40 text-red-500 hover:bg-red-500/10 font-bold text-xs shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clean Up Inactive Quizzes</span>
          </Button>
        )}

        <div className="flex items-center gap-1 p-1 rounded-2xl antigravity-glass border border-[var(--border)] shadow-sm">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)]'
            }`}
            title={t('admin.viewGrid')}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">{t('admin.viewGrid')}</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)]'
            }`}
            title={t('admin.viewTable')}
          >
            <TableIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t('admin.viewTable')}</span>
          </button>
        </div>

        <Link
          href={ROUTES.admin.quizCreate}
          className="btn-premium inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('teacherQuizzes.createQuiz')}</span>
        </Link>
      </div>
    </div>
  );
}
