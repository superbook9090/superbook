'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Plus, LayoutGrid, Table as TableIcon, Trash2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';

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
    <AdminPageBanner
      icon={HelpCircle}
      eyebrow={t('common.allQuizzes')}
      title={t('common.allQuizzes')}
      description={t('admin.manageQuizzesDesc')}
      tier={isSuperAdmin ? 'superadmin' : 'admin'}
      actions={
        <>
          {isSuperAdmin && onOpenCleanupModal && (
            <button
              type="button"
              onClick={onOpenCleanupModal}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-red-500/35 bg-red-500/8 text-red-600 dark:text-red-400 hover:bg-red-500/15 font-bold text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Clean Up Inactive Quizzes</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-[8px] text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
              title={t('admin.viewGrid')}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.viewGrid')}</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-[8px] text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
              title={t('admin.viewTable')}
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.viewTable')}</span>
            </button>
          </div>

          <Link
            href={ROUTES.admin.quizCreate}
            className="teacher-cta-btn min-h-[44px] px-4 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('teacherQuizzes.createQuiz')}</span>
          </Link>
        </>
      }
    />
  );
}
