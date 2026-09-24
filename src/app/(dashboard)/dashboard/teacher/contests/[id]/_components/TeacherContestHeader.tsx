'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, StopCircle, Trash2, Flame, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/lib/dateUtils';
import { ContestCountdown } from '@/features/contests/components/ContestCountdown';
import type { ContestItem } from '@/lib/api/contests';

interface TeacherContestHeaderProps {
  contest: ContestItem;
  state: ContestItem['computedState'];
  onEndContest: () => void;
  onDeleteContest: () => void;
  /** Override back link destination (default: teacher contests list) */
  backPath?: string;
  /** Override edit link destination (default: teacher edit route) */
  editPath?: string;
}

export default function TeacherContestHeader({
  contest,
  state,
  onEndContest,
  onDeleteContest,
  backPath,
  editPath,
}: TeacherContestHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={backPath || ROUTES.teacher.contests}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('contest.backToContests') || 'Back to Contests'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {state === 'upcoming' && (
            <Link
              href={editPath || ROUTES.teacher.contestEdit(contest._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border border-[var(--border)] shadow-xs transition-colors min-h-[44px]"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{t('common.edit') || 'Edit Contest'}</span>
            </Link>
          )}

          {state === 'live' && (
            <button
              type="button"
              onClick={onEndContest}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--warning-light)] text-[var(--warning-foreground)] border border-[var(--warning)]/30 shadow-xs hover:bg-[var(--warning-light)]/80 transition-colors min-h-[44px]"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>{t('contest.endContestEarly') || 'End Contest Early'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDeleteContest}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]/30 shadow-xs hover:bg-[var(--error-light)]/80 transition-colors min-h-[44px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('common.delete') || 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="hero-banner p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {state === 'live' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[var(--error)] text-white shadow-md animate-pulse">
                <Flame className="w-3 h-3" />
                LIVE NOW
              </span>
            ) : state === 'upcoming' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]/20">
                <Clock className="w-3 h-3" />
                UPCOMING
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                <CheckCircle className="w-3 h-3" />
                COMPLETED
              </span>
            )}

            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] uppercase">
              {contest.scheduleType.replace('_', '-')}
            </span>
          </div>

          <h1 className="heading-xl text-[var(--color-foreground)]">
            {contest.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--color-muted-foreground)]">
            <span>{t('contest.start') || 'Start'}: {formatDateTime(contest.startTime)}</span>
            <span>•</span>
            <span>{t('contest.end') || 'End'}: {formatDateTime(contest.endTime)}</span>
            <span>•</span>
            <span>{t('contest.duration') || 'Duration'}: {contest.duration} {t('common.mins') || 'mins'}</span>
          </div>
        </div>

        {state === 'live' && (
          <div className="p-4 rounded-2xl antigravity-glass bg-[var(--color-surface-muted)]/60 border border-[var(--border)] text-center shrink-0">
            <ContestCountdown
              targetDate={contest.endTime}
              label={t('contest.remainingLiveTime') || 'Remaining Live Time'}
              type="ends_in"
            />
          </div>
        )}
      </div>
    </div>
  );
}
