'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, StopCircle, Trash2, Flame, Clock, CheckCircle, Trophy } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
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
  onDeclareResults?: () => void;
  isDeclaringResults?: boolean;
  backPath?: string;
  editPath?: string;
}

export default function TeacherContestHeader({
  contest,
  state,
  onEndContest,
  onDeleteContest,
  onDeclareResults,
  isDeclaringResults,
  backPath,
  editPath,
}: TeacherContestHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3.5">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <BackButton
          href={backPath || ROUTES.teacher.contests}
          label={t('contest.backToContests')}
          className="text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--teacher-primary)]"
        />

        <div className="flex items-center gap-2 flex-wrap">
          {onDeclareResults && (state === 'completed' || state === 'live') && !contest.resultsDeclared && (
            <button
              type="button"
              onClick={onDeclareResults}
              disabled={isDeclaringResults}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/35 transition-colors min-h-[42px] cursor-pointer disabled:opacity-60"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{isDeclaringResults ? 'Declaring...' : 'Declare Results & Notify'}</span>
            </button>
          )}

          {contest.resultsDeclared && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/30">
              <CheckCircle className="w-3.5 h-3.5" />
              Results Declared
            </span>
          )}

          {state === 'upcoming' && (
            <Link
              href={editPath || ROUTES.teacher.contestEdit(contest._id)}
              className="teacher-pill-btn text-xs min-h-[42px]"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{t('common.edit')}</span>
            </Link>
          )}

          {state === 'live' && (
            <button
              type="button"
              onClick={onEndContest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--warning-light)] text-amber-800 dark:text-amber-300 border border-[var(--warning)]/35 hover:opacity-90 transition-opacity min-h-[42px] cursor-pointer"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>{t('contest.endContestEarly')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDeleteContest}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]/30 hover:opacity-90 transition-opacity min-h-[42px] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('common.delete')}</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <section className="teacher-panel overflow-hidden p-4 sm:p-6">
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'var(--teacher-gradient)' }}
          aria-hidden
        />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {state === 'live' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--error)] text-white animate-pulse">
                  <Flame className="w-3 h-3" />
                  LIVE NOW
                </span>
              ) : state === 'upcoming' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]/25">
                  <Clock className="w-3 h-3" />
                  UPCOMING
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border border-[var(--border)]">
                  <CheckCircle className="w-3 h-3" />
                  COMPLETED
                </span>
              )}

              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] uppercase border border-[var(--border)]/70">
                {contest.scheduleType.replace('_', '-')}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)]">
              {contest.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[var(--color-muted-foreground)]">
              <span>{t('contest.start')}: {formatDateTime(contest.startTime)}</span>
              <span>•</span>
              <span>{t('contest.end')}: {formatDateTime(contest.endTime)}</span>
              <span>•</span>
              <span>{t('contest.duration')}: {contest.duration} {t('common.mins')}</span>
            </div>
          </div>

          {state === 'live' && (
            <div className="p-3.5 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)]/80 text-center shrink-0 w-full md:w-auto">
              <ContestCountdown
                targetDate={contest.endTime}
                label={t('contest.remainingLiveTime')}
                type="ends_in"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
